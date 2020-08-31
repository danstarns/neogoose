import { GraphQLSchema, FieldDefinitionNode, print } from "graphql";
import {
  getInputByName,
  removeRelationshipDirective,
  getFieldTypeName,
} from "../graphql";
import { Runtime } from "../types";
import { Model } from "../classes";
import getRelationshipDirective from "./get-relationship-directive";
import { schemaComposer, ObjectTypeComposer } from "graphql-compose";
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import { makeExecutableSchema } from "@graphql-tools/schema";

function createValidationSchema(input: { runtime: Runtime }): GraphQLSchema {
  const modelNames = input.runtime.models.map((x) => x.name);

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

    const { relations, fields } = model.node.fields.reduce(
      (res, field) => {
        const { name: typeName } = getFieldTypeName(field);

        if (typeName && modelNames.includes(typeName)) {
          res.relations.push(field);
        } else {
          res.fields.push(field);
        }

        return res;
      },
      { relations: [], fields: [] }
    ) as {
      relations: FieldDefinitionNode[];
      fields: FieldDefinitionNode[];
    };

    const composeFields = fields.reduce((res, v) => {
      const name = v.name?.value;
      const type = node.getField(name).type;

      return {
        ...res,
        [name]: {
          type,
        },
      };
    }, {});

    const composeRelationFields = relations.reduce((res, f) => {
      const keyName = f.name.value;
      const { prettyBy } = getFieldTypeName(f);

      return {
        ...res,
        [keyName]: prettyBy(`${model.name}_${keyName}_Input`),
      };
    }, {});

    if (model.properties) {
      const name = model.properties.name.value;

      const typeDefs = print({
        kind: "Document",
        definitions: [model.properties],
      });

      schemaComposer.createInputTC(
        typeDefs.replace(name, `${model.name}_Input`)
      );
    } else {
      schemaComposer.createInputTC({
        name: `${model.name}_Input`,
        fields: {
          ...composeFields,
          ...composeRelationFields,
        },
      });
    }

    relations.forEach((field) => {
      const { name: referenceName } = getFieldTypeName(field);
      const referenceModel = input.runtime.models.find(
        (x) => x.name === referenceName
      );
      createNode(referenceModel);

      const keyName = field.name.value;
      node.removeField(keyName);

      const directive = getRelationshipDirective(field);

      if (!directive) {
        throw new Error(`${model.name}.${keyName} @Relationship required`);
      }

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
            `${model.name}.${keyName} @Relationship(properties: ${name}) ${name} not found`
          );
        }

        const typeDefs = print({
          kind: "Document",
          definitions: [propertiesInput],
        });

        schemaComposer.createInputTC(
          typeDefs.replace(name, `${model.name}_${keyName}_Properties`)
        );

        schemaComposer.createInputTC({
          name: `${model.name}_${keyName}_Input`,
          fields: {
            properties: `${model.name}_${keyName}_Properties`,
            node: `${model.name}_Input`,
          },
        });
      } else {
        schemaComposer.createInputTC({
          name: `${model.name}_${keyName}_Input`,
          fields: {
            node: `${model.name}_Input`,
          },
        });
      }
    });

    if (model.fields) {
      model.node.fields.forEach((field) => {
        const resolve = model.fields[field.name.value] as any;

        if (resolve) {
          node.addFields({
            [field.name.value]: {
              type: node.getField(field.name.value).type.getTypeName(),
              resolve,
            },
          });
        }
      });
    }

    schemaComposer.Mutation.addFields({
      [`${model.name}CreateOneInput`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `${model.name}_Input`,
        },
      },
      [`${model.name}CreateManyInput`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `[${model.name}_Input]!`,
        },
      },
    });

    schemaComposer.Query.addFields({
      [`${model.name}FindOneOutput`]: {
        type: `${model.name}`,
        resolve: (root, args, ctx) => ctx.input,
      },
      [`${model.name}FindManyOutput`]: {
        type: `[${model.name}]!`,
        resolve: (root, args, ctx) => ctx.input,
      },
    });
    return node;
  }

  input.runtime.models.forEach(createNode);

  const typeDefs = schemaComposer.toSDL();
  const resolvers = schemaComposer.getResolveMethods();

  const schema = makeExecutableSchema({
    typeDefs: [constraintDirectiveTypeDefs, typeDefs],
    resolvers,
    schemaTransforms: [constraintDirective()],
  });

  return schema;
}

export = createValidationSchema;
