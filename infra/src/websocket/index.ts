import { APIGatewayProxyEventV2 } from "aws-lambda";
import * as AWS from "aws-sdk";

let apiEndpoint;

if (process.env.WEBSOCKET_API_URL) {
  apiEndpoint = process.env.WEBSOCKET_API_URL.includes("wss://")
    ? process.env.WEBSOCKET_API_URL.split("wss://")[1]
    : process.env.WEBSOCKET_API_URL;
}

const api = new AWS.ApiGatewayManagementApi({
  endpoint: apiEndpoint,
});

interface Payload {
  auth?: string;
  message?: any;
}

interface Data {
  type: string;
  payload: Payload;
}

interface DBCredentials {
  username: string;
  password: string;
  port: number;
  dbname: string;
  host: string;
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

async function getDBAccess(
  secretName: string
): Promise<DBCredentials | boolean> {
  let secretsManager = new AWS.SecretsManager();
  const res = (await secretsManager
    .getSecretValue({ SecretId: secretName })
    .promise()) as AWS.SecretsManager.GetSecretValueResponse;
  if (res && res.SecretString) {
    const payload = JSON.parse(res.SecretString);

    return {
      username: payload.username,
      password: payload.password,
      port: payload.port,
      dbname: payload.dbname,
      host: payload.host,
    } as DBCredentials;
  }
  return false;
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
                  if (process.env.SECRET_NAME) {
                    const rep = await getDBAccess(process.env.SECRET_NAME);
                    if (rep) {
                      await sendData(connectionId, {
                        type: "loginSuccess",
                        payload: {
                          message: rep,
                        },
                      });
                    }
                  }
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
