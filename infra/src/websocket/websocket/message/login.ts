import { Payload } from "../../interfaces";
import { getDBAccess } from "../../db";
import API from "../../api";

export default async function handleLogin(payload: Payload, api: API) {
  if (!payload.auth) {
    throw new Error("Auth missing");
  }

  if (!process.env.SECRET_NAME) {
    throw new Error("Secret name missing");
  }

  const response = await getDBAccess(process.env.SECRET_NAME);
  if (response) {
    await api.sendData({
      type: "loginFailed",
      payload: { message: response },
    });
  } else {
    await api.sendData({
      type: "loginFailed",
      payload: {},
    });
  }
}
