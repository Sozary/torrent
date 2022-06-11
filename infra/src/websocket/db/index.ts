import { DBCredentials } from "../interfaces";
import * as AWS from "aws-sdk";

export async function getDBAccess(
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
