import { APIGatewayProxyEventV2 } from "aws-lambda";
import * as websocket from "./websocket";

exports.handle = async (event: APIGatewayProxyEventV2) => {
  const route = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body || "{}");

  try {
    switch (route) {
      case "$connect":
        await websocket.handleConnect();
        break;
      case "$disconnect":
        await websocket.handleDisconnect();
        break;
      case "message":
        if (!body.data) {
          console.log("Data missing");
          return {
            statusCode: 500,
          };
        }
        await websocket.handleMessage(body.data, connectionId);
        break;
      default:
        console.log("unknown route");
    }
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 200,
  };
};
