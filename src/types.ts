import { Connection, Model } from "./classes";
import { DocumentNode, GraphQLSchema } from "graphql";
import { SessionMode } from "neo4j-driver";
import { IResolvers } from "@graphql-tools/utils";

export type TypeDefsUnion = string | DocumentNode;

export type Runtime = {
  models: Model[];
  // The main connection
  connection?: Connection;
  // Connections created with createConnection
  connections: Connection[];
  validationSchema?: GraphQLSchema;
};

export type Resolvers = IResolvers;

export interface ModelOptions {
  typeDefs: TypeDefsUnion;
  sessionOptions?: SessionOptions;
  connection?: Connection;
  resolvers?: Resolvers;
}

export interface SessionOptions {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  fetchSize?: number;
  database?: string;
}
