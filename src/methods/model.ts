import { Runtime } from "../types";
import { parseTypeDefs } from "../utils";
import { ModelOptions } from "../types";
import { Model } from "../classes";

function model(runtime: Runtime) {
  return (name: string, options: ModelOptions): Model => {
    if (!name) {
      throw new TypeError("name required");
    }

    if (!options) {
      throw new TypeError("options required");
    }

    if (!options.typeDefs) {
      throw new TypeError("options.typeDefs required");
    }

    const document = parseTypeDefs(options.typeDefs);

    const model = new Model({ name, document });

    runtime.models.push(model);

    return model;
  };
}

export = model;
