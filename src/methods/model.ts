import { Runtime, ModelOptions } from "../types";
import { Model, ModelInput } from "../classes";
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
      throw new Error("typeDefs requires 'type User'/ObjectTypeDefinition");
    }

    input.node = node;

    const validationDirective = getValidationDirective(node);

    if (validationDirective) {
      const onCreateArg = validationDirective.arguments.find(
        (x) => x.name.value === "ON_CREATE"
      );

      const onMatchArg = validationDirective.arguments.find(
        (x) => x.name.value === "ON_MATCH"
      );

      if (!onCreateArg && !onMatchArg) {
        throw new Error("@Validation ON_CREATE and or ON_MATCH required");
      }

      if (onCreateArg) {
        const onCreateInput = getInputByName({
          document,
          // @ts-ignore
          name: onCreateArg.value.value,
        });

        if (!onCreateInput) {
          throw new Error(`input ${onCreateArg.name.value} not found`);
        }

        input.inputs.ON_CREATE = onCreateInput;
      }

      if (onMatchArg) {
        const onMatchInput = getInputByName({
          document,
          // @ts-ignore
          name: onMatchArg.value.value,
        });

        if (!onMatchInput) {
          throw new Error(`input ${onMatchArg.name.value} not found`);
        }

        input.inputs.ON_MATCH = onMatchInput;
      }
    }

    document = removeValidationDirective(document);

    input.document = document;

    const model = new Model<T>(input);

    runtime.models.push(model);

    return model;
  };
}

export = model;
