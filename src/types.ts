import { Connection, Model } from "./classes";

export type Runtime = {
  models: Model[];
  // The main connection
  connection?: Connection;
  // Connections created with createConnection
  connections: Connection[];
};
