import { GraphQLSchema, FieldDefinitionNode, print } from "graphql";
import {
  getInputByName,
  removeRelationshipDirective,
  getFieldTypeName,
} from "../graphql";
import { Runtime } from "../types";
import { Model } from "../classes";
import getRelationshipDirective from "./get-relationship-directive";
import {
  schemaComposer,
  ObjectTypeComposer,
  ComposeOutputType,
} from "graphql-compose";
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import { makeExecutableSchema } from "@graphql-tools/schema";

function createValidationSchema(input: { runtime: Runtime }): GraphQLSchema {
  function createNode(model: Model): ObjectTypeComposer {
    let node: ObjectTypeComposer;

    try {
      node = schemaComposer.getOTC(model.name);

      return node;
    } catch (error) {
      // 404
      node = schemaComposer.createObjectTC(
        print({
          kind: "Document",
          definitions: [removeRelationshipDirective(model.node)],
        })
      );
    }

    const composeFields = model.fields.reduce((res, v) => {
      const name = v.name?.value;
      const type = node.getField(name).type;

      return {
        ...res,
        [name]: {
          type,
        },
      };
    }, {});

    const composeRelationFields = model.relations.reduce((res, f) => {
      const name = f.name.value;
      const type = getFieldTypeName(f).prettyBy(`${model.name}_${name}_Input`);

      return {
        ...res,
        [name]: {
          type,
        },
      };
    }, {});

    if (model.properties) {
      const name = model.properties.name.value;

      const typeDefs = print({
        kind: "Document",
        definitions: [model.properties],
      });

      const inp = schemaComposer.createInputTC(
        typeDefs.replace(name, `${model.name}_Input`)
      );

      inp.addFields(composeRelationFields);
    } else {
      schemaComposer.createInputTC({
        name: `${model.name}_Input`,
        fields: {
          ...composeFields,
          ...composeRelationFields,
        },
      });
    }

    model.relations.forEach((field) => {
      const referenceModel = input.runtime.models.find(
        (x) => x.name === getFieldTypeName(field).name
      );

      createNode(referenceModel);

      node.removeField(field.name.value);

      const directive = getRelationshipDirective(field);

      const propertiesArgument = directive.arguments.find(
        (x) => x.name.value === "properties"
      );

      if (propertiesArgument) {
        // @ts-ignore
        const name = propertiesArgument.value?.value;

        const propertiesInput = getInputByName({
          document: model.document,
          name: name,
        });

        if (!propertiesInput) {
          throw new Error(
            `${model.name}.${field.name.value} @Relationship(properties: ${name}) ${name} not found`
          );
        }

        const typeDefs = print({
          kind: "Document",
          definitions: [propertiesInput],
        });

        schemaComposer.createInputTC(
          typeDefs.replace(name, `${model.name}_${field.name.value}_Properties`)
        );

        schemaComposer.createInputTC({
          name: `${model.name}_${field.name.value}_Input`,
          fields: {
            properties: {
              type: `${model.name}_${field.name.value}_Properties`,
            },
            node: { type: `${referenceModel.name}_Input` },
          },
        });
      } else {
        schemaComposer.createInputTC({
          name: `${model.name}_${field.name.value}_Input`,
          fields: {
            node: {
              type: `${referenceModel.name}_Input`,
            },
          },
        });
      }
    });

    schemaComposer.createInputTC({
      name: `${model.name}_Find_Input`,
      fields: Object.entries(composeFields).reduce(
        (res, [k, v]: [string, { type: ComposeOutputType<any> }]) => ({
          ...res,
          [k]: { type: v.type.getTypeName().replace(/!/g, "") },
        }),
        {}
      ),
    });

    schemaComposer.Mutation.addFields({
      [`${model.name}CreateOneInput`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `${model.name}_Input!`,
        },
      },
    });

    schemaComposer.Query.addFields({
      // REMOVE
      [`${model.name}`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `${model.name}_Input!`,
        },
      },
    });

    return node;
  }

  input.runtime.models.forEach(createNode);

  const typeDefs = schemaComposer.toSDL();
  const resolvers = schemaComposer.getResolveMethods();

  const schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers: input.runtime.models.reduce(
      (res, m) => ({ ...res, ...(m.resolvers ? m.resolvers : {}) }),
      resolvers
    ),
    schemaTransforms: [constraintDirective()],
  });

  return schema;
}

export = createValidationSchema;
