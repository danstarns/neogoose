import { Connection, Model } from "./classes";
import { DocumentNode, GraphQLSchema } from "graphql";
import { SessionMode } from "neo4j-driver";
import { IResolvers } from "@graphql-tools/utils";

export type TypeDefsUnion = string | DocumentNode;

export type Runtime = {
  /**
   * The models created with model
   */
  models: Model[];
  /**
   * The Main connection
   */
  connection?: Connection;
  /**
   * Connections created with createConnection
   */
  connections: Connection[];
  /**
   * Schema CRUD input and output is passed through
   */
  validationSchema?: GraphQLSchema;
};

export type Resolvers = IResolvers;

export interface ModelOptions {
  /**
   * GraphQL schema definition @see https://graphql.org/learn/schema/
   * used to validate model CRUD operations
   */
  typeDefs: TypeDefsUnion;
  /**
   * The options passed directly into driver.session @see https://github.com/neo4j/neo4j-javascript-driver
   */
  sessionOptions?: SessionOptions;
  /**
   * Override the default connection for this model
   */
  connection?: Connection;
  /**
   * Resolvers to attach to validation and neo4j-graphql-js schemas
   */
  resolvers?: Resolvers;
}

export interface SessionOptions {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  fetchSize?: number;
  database?: string;
}
