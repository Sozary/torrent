import { APIGatewayProxyEventV2 } from "aws-lambda";

exports.handle = async (event: APIGatewayProxyEventV2) => {
  const route = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;

  switch (route) {
    case "$connect":
      console.log("Connection");
      break;
    case "$disconnect":
      console.log("Disconnection");
      break;
    case "message":
      console.log("Message received", event);
      break;
    default:
      console.log("unknown route");
  }
  return {
    statusCode: 200,
    body: process.env.WEBSOCKET_API_URL,
  };
};
