import { Runtime, CreateOrGetModel, ModelInput } from "../types";
import { Model, Connection } from "../classes";
import {
  parseTypeDefs,
  getNodeByName,
  getValidationDirective,
  getInputByName,
  removeValidationDirective,
  getRelationshipDirective,
  getNeo4jCypherDirective,
} from "../graphql";
import { FieldDefinitionNode } from "graphql";

function model<T = any>(runtime: Runtime): CreateOrGetModel {
  return (name, options) => {
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

    const validationDirective = getValidationDirective(node);

    if (validationDirective) {
      const propertiesArg = validationDirective.arguments.find(
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

    const { relations, fields, cyphers } = node.fields.reduce(
      (res, field) => {
        const relationshipDirective = getRelationshipDirective(field);
        const cypherDirective = getNeo4jCypherDirective(field);

        if (relationshipDirective) {
          res.relations.push(field);
        } else if (cypherDirective) {
          res.cyphers.push(field);
        } else {
          res.fields.push(field);
        }

        return res;
      },
      { relations: [], fields: [], cyphers: [] }
    ) as {
      relations: FieldDefinitionNode[];
      fields: FieldDefinitionNode[];
      cyphers: FieldDefinitionNode[];
    };

    input.relations = relations;
    input.fields = fields;
    input.cyphers = cyphers;

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
