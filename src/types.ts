import { Connection, Model } from "./classes";
import { DocumentNode, GraphQLSchema } from "graphql";
import { SessionMode } from "neo4j-driver";

export type TypeDefsUnion = string | DocumentNode;

export type Runtime = {
  models: Model[];
  // The main connection
  connection?: Connection;
  // Connections created with createConnection
  connections: Connection[];
  schema: GraphQLSchema;
};

export interface ModelOptions {
  typeDefs: TypeDefsUnion;
  sessionOptions?: SessionOptions;
  connection?: Connection;
}

export interface SessionOptions {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  fetchSize?: number;
  database?: string;
}
