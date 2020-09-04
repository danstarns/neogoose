import { GraphQLSchema } from "graphql";
import { Runtime } from "../types";

function createNeoGQLSchema(input: { runtime: Runtime }): GraphQLSchema {
  return {} as GraphQLSchema;
}

export = createNeoGQLSchema;
