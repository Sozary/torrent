import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { WebSocketLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as apigwv2 from "@aws-cdk/aws-apigatewayv2-alpha";

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fn = new NodejsFunction(this, "Websocket", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "handle",
      entry: path.join(__dirname, "/../src/websocket/index.ts"),
      bundling: {
        minify: true,
        externalModules: ["aws-sdk"],
      },
    });

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

    webSocketApi.addRoute("message", {
      integration: new WebSocketLambdaIntegration("Message", fn),
    });

    const stage = new apigwv2.WebSocketStage(this, "Websocket Stage", {
      webSocketApi,
      stageName: "dev",
      autoDeploy: true,
    });

    fn.addEnvironment("WEBSOCKET_API_URL", stage.url);

    new CfnOutput(this, "Websocket Url", {
      value: stage.url,
      description: "Url of the websocket API",
      exportName: "websocket-url",
    });

    // const websocketStage = new apigwv2.CfnStage(this, "MyStage", {
    //   apiId: myAPI.ref,
    //   stageName: "prod",
    //   autoDeploy: true,
    // });
  }
}
