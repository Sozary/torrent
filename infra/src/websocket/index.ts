import { APIGatewayProxyEventV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

const api = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.WEBSOCKET_API_URL,
});

interface Payload {
  auth?: string;
  message?: string;
}

interface Data {
  type: string;
  payload: Payload;
}

function logUser(auth: string): boolean {
  return true;
}
async function sendData(connectionId: string, data: Data) {
  await api
    .postToConnection({
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(data)),
    })
    .promise();
}

exports.handle = async (event: APIGatewayProxyEventV2) => {
  const route = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body || "{}");

  switch (route) {
    case "$connect":
      console.log("connect");
      break;
    case "$disconnect":
      console.log("disconnect");
      break;
    case "message":
      try {
        const data = body?.data as Data | undefined;
        if (data && data.type) {
          switch (data.type) {
            case "login":
              if (data.payload.auth) {
                const response = logUser(data.payload.auth);
                if (response) {
                  await sendData(connectionId, {
                    type: "loginSuccess",
                    payload: {
                      message: "Login successful",
                    },
                  });
                }
              }
              break;
            default:
              await sendData(connectionId, {
                type: "typeUnknown",
                payload: {
                  message: "Type unknown",
                },
              });
          }
        }
      } catch (e) {
        console.log(e);
        return {
          statusCode: 500,
        };
      }
      break;
    default:
      console.log("unknown route");
  }
  return {
    statusCode: 200,
  };
};
