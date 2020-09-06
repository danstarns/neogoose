import { Connection, Model } from "./classes";
import {
  DocumentNode,
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  FieldDefinitionNode,
} from "graphql";
import { SessionMode, Driver } from "neo4j-driver";
import { IResolvers } from "@graphql-tools/utils";
import { AuthToken, Config } from "neo4j-driver";

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

/**
 * Input to Class constructor
 */
export interface ModelInput {
  name: string;
  document: DocumentNode;
  sessionOptions?: SessionOptions;
  node: ObjectTypeDefinitionNode;
  properties?: InputObjectTypeDefinitionNode;
  runtime: Runtime;
  connection?: Connection;
  resolvers?: Resolvers;
  fields: FieldDefinitionNode[];
  relations: FieldDefinitionNode[];
  cyphers: FieldDefinitionNode[];
}

/**
 * Input to Class constructor
 */
export interface ConnectionInput {
  driver: Driver;
  config: Config;
}

export interface SessionOptions {
  defaultAccessMode?: SessionMode;
  bookmarks?: string | string[];
  fetchSize?: number;
  database?: string;
}

export type Connect = (
  url: string,
  authToken?: AuthToken,
  config?: Config
) => Promise<Connection>;

export type CreateConnection = (
  url: string,
  authToken?: AuthToken,
  config?: Config
) => Promise<Connection>;

export type CreateOrGetModel = (name: string, options?: ModelOptions) => Model;

export interface CreateOneInput {
  [k: string]:
    | any
    | any[]
    | { properties: { [kk: string]: any }; node: CreateOneInput }
    | { properties: { [kk: string]: any }; node: CreateOneInput }[];
}

export { Connection, Model };
