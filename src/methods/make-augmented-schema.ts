import { Runtime, AugmentOptions } from "../types";
import { createNeoGQLSchema } from "../graphql";
import { GraphQLSchema } from "graphql";

function makeAugmentedSchema(runtime: Runtime) {
  return (options: AugmentOptions = {}): GraphQLSchema => {
    return createNeoGQLSchema({ runtime, options });
  };
}

export = makeAugmentedSchema;
