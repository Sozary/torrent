import { APIGatewayProxyEventV2 } from "aws-lambda";

exports.handle = async (event: APIGatewayProxyEventV2) => {
  return {
    body: JSON.stringify({ message: "Successful lambda invocation" }),
    statusCode: 200,
  };
};
