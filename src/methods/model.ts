import { Runtime, CreateOrGetModel, ModelInput } from "../types";
import { Model, Connection } from "../classes";
import {
  parseTypeDefs,
  getNodeByName,
  getValidationDirective,
  getInputByName,
  getRelationDirective,
  getNeo4jCypherDirective,
  getFieldTypeName,
} from "../graphql";
import { FieldDefinitionNode, ObjectTypeDefinitionNode } from "graphql";

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
      typeDefs: options.typeDefs,
    };

    if (options.sessionOptions) {
      input.sessionOptions = options.sessionOptions;
    }

    const document = parseTypeDefs(options.typeDefs);

    input.document = document;

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

    let selectionSet = "{";

    const documentReferenceNames = document.definitions
      .filter((x) => Boolean(x.kind === "ObjectTypeDefinition"))
      .map((x: ObjectTypeDefinitionNode) => x.name.value);

    const { relations, fields, cyphers, nested } = node.fields.reduce(
      (res, field) => {
        const relationshipDirective = getRelationDirective(field);
        const cypherDirective = getNeo4jCypherDirective(field);
        const isNested = documentReferenceNames.includes(
          getFieldTypeName(field).name
        );

        if (relationshipDirective) {
          res.relations.push(field);
        } else if (cypherDirective) {
          res.cyphers.push(field);
        } else if (isNested) {
          selectionSet += field.name.value;
          res.nested.push(field);
        } else {
          selectionSet += field.name.value;
          res.fields.push(field);
        }

        selectionSet += "\n";

        return res;
      },
      { relations: [], fields: [], cyphers: [], nested: [] }
    ) as {
      relations: FieldDefinitionNode[];
      fields: FieldDefinitionNode[];
      cyphers: FieldDefinitionNode[];
      nested: FieldDefinitionNode[];
    };

    selectionSet += "}";

    if (options.selectionSet) {
      selectionSet = options.selectionSet;
    }

    input.selectionSet = selectionSet;
    input.relations = relations;
    input.fields = fields;
    input.cyphers = cyphers;
    input.nested = nested;

    if (options.resolvers) {
      input.resolvers = options.resolvers;
    }

    if (options.connection) {
      if (!(options.connection instanceof Connection)) {
        throw new Error("invalid connection");
      }

      input.connection = options.connection;
    }

    const model = new Model<T>(input);

    runtime.models.push(model);

    return model;
  };
}

export = model;
