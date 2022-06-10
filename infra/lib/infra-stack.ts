import {
  Stack,
  StackProps,
  CfnOutput,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // Create a VPC with two public subnets
    const vpc = new ec2.Vpc(this, "torrent-vpc", {
      cidr: "10.0.0.0/16",
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: "private-subnet-1",
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
        {
          name: "public-subnet-1",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });
    // ===========================

    // CREATE THE WEBSOCKET LAMBDA
    const fn = new NodejsFunction(this, "Websocket", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "handle",
      vpc,
      entry: path.join(__dirname, "/../src/websocket/index.ts"),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
    });

    // ADD A POLICY TO THE LAMBDA
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ["arn:aws:execute-api:*:*:*/*/@connections/*"],
        actions: ["*"],
      })
    );
    // ===========================

    // CREATE THE WEBSOCKET API
    const webSocketApi = new apigwv2.WebSocketApi(this, "Websocket API", {
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration("ConnectIntegration", fn),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DisconnectIntegration",
          fn
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration("DefaultIntegration", fn),
      },
    });

    const stage = new apigwv2.WebSocketStage(this, "Websocket Stage", {
      webSocketApi,
      stageName: "dev",
      autoDeploy: true,
    });

    webSocketApi.addRoute("message", {
      integration: new WebSocketLambdaIntegration("Message", fn),
    });

    new CfnOutput(this, "WebsocketUrl", {
      value: stage.url,
      description: "Url of the websocket API",
      exportName: "websocket-url",
    });

    fn.addEnvironment("WEBSOCKET_API_URL", stage.url);
    // ===========================

    // CREATE THE RDS INSTANCE
    const credentials = rds.Credentials.fromGeneratedSecret("postgres");
    const dbInstance = new rds.DatabaseInstance(this, "db-instance", {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
      },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14_2,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE3,
        ec2.InstanceSize.MICRO
      ),
      credentials,
      multiAz: false,
      allocatedStorage: 100,
      maxAllocatedStorage: 105,
      allowMajorVersionUpgrade: false,
      autoMinorVersionUpgrade: true,
      deleteAutomatedBackups: true,
      deletionProtection: false,
      databaseName: "torrent",
      publiclyAccessible: false,
    });

    dbInstance.connections.allowFrom(fn, ec2.Port.tcp(5432));
    // arn:aws:secretsmanager:eu-central-1:763277165133:secret:InfraStackdbinstanceSecret1-AcZf8QW0ebJG-cPMiLh
    let secret;
    if (dbInstance?.secret?.secretName) {
      secret = secretsmanager.Secret.fromSecretNameV2(
        this,
        "SecretFromName",
        dbInstance.secret.secretName
      );
      secret.grantRead(fn);
    }

    if (dbInstance.secret) {
      fn.addEnvironment("SECRET_NAME", dbInstance.secret.secretName);
    }
    // ===========================
  }
}
