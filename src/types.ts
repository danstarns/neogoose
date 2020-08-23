import { Connection, Model } from "./classes";
import { DocumentNode } from "graphql";
import { SessionMode } from "neo4j-driver";

export type TypeDefsUnion = string | DocumentNode;

export type Runtime = {
  models: Model[];
  // The main connection
  connection?: Connection;
  // Connections created with createConnection
  connections: Connection[];
};

export interface ModelOptions {
  typeDefs: TypeDefsUnion;
  session?: SessionOptions;
}

export interface SessionOptions {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  fetchSize?: number;
  database?: string;
}
