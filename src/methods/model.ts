import { Runtime, ModelOptions } from "../types";
import { Model, ModelInput, Connection } from "../classes";
import {
  parseTypeDefs,
  getNodeByName,
  getValidationDirective,
  getInputByName,
  removeValidationDirective,
} from "../graphql";

function model<T = any>(runtime: Runtime) {
  return (name: string, options?: ModelOptions): Model => {
    if (!name) {
      throw new TypeError("name required");
    }

    if (!options) {
      return runtime.models.find((x) => x.name === name);
    }

    if (!options.typeDefs) {
      throw new TypeError("options.typeDefs required");
    }

    if (runtime.models.find((x) => x.name === name)) {
      throw new Error(`Model name: '${name}' conflict`);
    }

    // @ts-ignore
    const input: ModelInput = {
      name,
      // @ts-ignore
      inputs: {},
      runtime,
    };

    if (options.sessionOptions) {
      input.sessionOptions = options.sessionOptions;
    }

    let document = parseTypeDefs(options.typeDefs);

    ["Mutation", "Query", "Subscription"].forEach((kind) => {
      const node = getNodeByName({ document, name: kind });

      if (node) {
        throw new Error(`typeDefs.${kind} not supported`);
      }
    });

    const node = getNodeByName({ document, name });

    if (!node) {
      throw new Error(`typeDefs requires 'type ${name}'/ObjectTypeDefinition`);
    }

    input.node = node;

    const directive = getValidationDirective(node);

    if (directive) {
      const propertiesArg = directive.arguments.find(
        (x) => x.name.value === "properties"
      );

      if (!propertiesArg) {
        throw new Error("@Validation(properties) properties required");
      }

      // @ts-ignore
      const name = propertiesArg.value?.value;

      const propertiesInput = getInputByName({ document, name });

      if (!propertiesInput) {
        throw new Error(`properties ${name} not found`);
      }

      input.properties = propertiesInput;
    }

    if (options.resolvers) {
      input.resolvers = options.resolvers;
    }

    if (options.connection) {
      if (!(options.connection instanceof Connection)) {
        throw new Error("invalid connection");
      }

      input.connection = options.connection;
    }

    document = removeValidationDirective(document);

    input.document = document;

    const model = new Model<T>(input);

    runtime.models.push(model);

    return model;
  };
}

export = model;
