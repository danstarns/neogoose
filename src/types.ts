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
  validationSchema?: GraphQLSchema;
};

export type Resolve = (
  root: any,
  args: { [k: string]: any },
  context: { [k: string]: any },
  info: DocumentNode
) => void;

export interface ModelOptions {
  typeDefs: TypeDefsUnion;
  sessionOptions?: SessionOptions;
  connection?: Connection;
  fields?: { [k: string]: Resolve };
}

export interface SessionOptions {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  fetchSize?: number;
  database?: string;
}
