import { Data } from "../../interfaces";
import handleLogin from "./login";
import API from "../../api";

export async function handleMessage(data: Data, connectionId: string) {
  if (!data.type) {
    throw new Error("Type is required");
  }

  const api = new API(connectionId);

  switch (data.type) {
    case "login":
      await handleLogin(data.payload, api);
      break;
    default:
      await api.sendData({
        type: "typeUnknown",
        payload: {
          message: "Type unknown",
        },
      });
  }
}
