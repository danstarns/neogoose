import { GraphQLSchema, print } from "graphql";
import { getInputByName, getFieldTypeName } from "../graphql";
import { Runtime } from "../types";
import { Model } from "../classes";
import getRelationshipDirective from "./get-relationship-directive";
import {
  ObjectTypeComposer,
  ComposeOutputType,
  SchemaComposer,
} from "graphql-compose";
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import { makeExecutableSchema } from "@graphql-tools/schema";

function createValidationSchema(input: { runtime: Runtime }): GraphQLSchema {
  const compose = new SchemaComposer();

  function createNode(model: Model): ObjectTypeComposer {
    let node: ObjectTypeComposer;

    try {
      node = compose.getOTC(model.name);

      return node;
    } catch (error) {
      // 404
      node = compose.createObjectTC(
        print({
          kind: "Document",
          definitions: [
            {
              kind: "ObjectTypeDefinition",
              name: { kind: "Name", value: model.name },
              fields: model.fields,
            },
          ],
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

      const inp = compose.createInputTC(
        typeDefs.replace(name, `${model.name}_Input`)
      );

      inp.addFields(composeRelationFields);
    } else {
      compose.createInputTC({
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

        compose.createInputTC(
          typeDefs.replace(name, `${model.name}_${field.name.value}_Properties`)
        );

        compose.createInputTC({
          name: `${model.name}_${field.name.value}_Input`,
          fields: {
            properties: {
              type: `${model.name}_${field.name.value}_Properties`,
            },
            node: { type: `${referenceModel.name}_Input` },
          },
        });
      } else {
        compose.createInputTC({
          name: `${model.name}_${field.name.value}_Input`,
          fields: {
            node: {
              type: `${referenceModel.name}_Input`,
            },
          },
        });
      }
    });

    compose.createInputTC({
      name: `${model.name}_Find_Input`,
      fields: Object.entries(composeFields).reduce(
        (res, [k, v]: [string, { type: ComposeOutputType<any> }]) => ({
          ...res,
          [k]: { type: v.type.getTypeName().replace(/!/g, "") },
        }),
        {}
      ),
    });

    compose.Mutation.addFields({
      [`${model.name}CreateOneInput`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `${model.name}_Input!`,
        },
      },
    });

    compose.Query.addFields({
      // TODO
      [`${model.name}`]: {
        type: model.name,
        resolve: () => true,
        args: {
          input: `${model.name}_Input!`,
        },
      },
    });

    return node;
  }

  input.runtime.models.forEach(createNode);

  const typeDefs = compose.toSDL();
  const resolvers = compose.getResolveMethods();

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
