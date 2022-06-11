import * as AWS from "aws-sdk";
import { Data } from "../interfaces";

export default class API {
  api: AWS.ApiGatewayManagementApi;
  connectionId: string;

  constructor(connectionId: string) {
    if (process.env.WEBSOCKET_API_URL) {
      const apiEndpoint = process.env.WEBSOCKET_API_URL.includes("wss://")
        ? process.env.WEBSOCKET_API_URL.split("wss://")[1]
        : process.env.WEBSOCKET_API_URL;
      this.api = new AWS.ApiGatewayManagementApi({
        endpoint: apiEndpoint,
      });
      this.connectionId = connectionId;
    } else {
      throw new Error("API endpoint missing");
    }
  }

  async sendData(data: Data) {
    await this.api
      .postToConnection({
        ConnectionId: this.connectionId,
        Data: Buffer.from(JSON.stringify(data)),
      })
      .promise();
  }
}
