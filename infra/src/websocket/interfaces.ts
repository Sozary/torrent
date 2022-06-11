export interface Payload {
  auth?: string;
  message?: any;
}

export interface Data {
  type: string;
  payload: Payload;
}

export interface DBCredentials {
  username: string;
  password: string;
  port: number;
  dbname: string;
  host: string;
}
