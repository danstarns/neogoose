import { Runtime } from "../types";
import { parseTypeDefs } from "../utils";
import { ModelOptions } from "../types";
import { Model } from "../classes";

function model(runtime: Runtime) {
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

    const document = parseTypeDefs(options.typeDefs);

    const nameNode = document.definitions.find(
      (x) => x.kind === "ObjectTypeDefinition" && x.name.value === name
    );

    if (!nameNode) {
      throw new Error("typeDefs requires 'type User'/ObjectTypeDefinition");
    }

    const model = new Model({ name, document });

    runtime.models.push(model);

    return model;
  };
}

export = model;
