import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";

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
  }
}
