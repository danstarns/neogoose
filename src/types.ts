import { Connection, Model } from "./classes";
import { DocumentNode } from "graphql";

export type Runtime = {
  models: Model[];
  // The main connection
  connection?: Connection;
  // Connections created with createConnection
  connections: Connection[];
};

export interface ModelOptions {
  typeDefs: string | DocumentNode;
}
