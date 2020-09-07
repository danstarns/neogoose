import { GraphQLSchema, print } from "graphql";
import { getInputByName, getFieldTypeName } from "../graphql";
import { Runtime } from "../types";
import { Model } from "../classes";
import getRelationshipDirective from "./get-relationship-directive";
import {
  ObjectTypeComposer,
  SchemaComposer,
  ComposeOutputType,
} from "graphql-compose";
import {
  constraintDirective,
  constraintDirectiveTypeDefs,
} from "graphql-constraint-directive";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import removeNeo4jGQLFieldDirectives from "./remove-neo4j-gql-field-directives";

function createValidationSchema(input: { runtime: Runtime }): GraphQLSchema {
  const compose = new SchemaComposer();

  function createNode(model: Model): ObjectTypeComposer {
    let node: ObjectTypeComposer;

    const otherTypes = print({
      kind: model.document.kind,
      definitions: model.document.definitions
        .map((x) => {
          if (x.kind === "ObjectTypeDefinition") {
            return {
              ...x,
              fields: x.fields.map(removeNeo4jGQLFieldDirectives),
            };
          }

          return x;
        })
        .filter((x) => {
          switch (x.kind) {
            case "ObjectTypeDefinition":
              if (x.name.value === model.name) {
                return false;
              } else {
                return true;
              }

            default:
              return true;
          }
        }),
    });

    /*
     * Without fix 'Syntax Error: Unexpected <EOF> occurs'...
     * so strange I know.
     */
    const fix = "type Query {test: Boolean}";
    compose.addTypeDefs(otherTypes + fix);

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
              fields: [...model.fields, ...model.nested].map(
                removeNeo4jGQLFieldDirectives
              ),
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
      [`${model.name}FindOneInput`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `${model.name}_Find_Input`,
        },
      },
      [`${model.name}FindOneOutput`]: {
        type: model.name,
        resolve: (root, args, ctx: any) => ctx.input,
      },
    });

    return node;
  }

  input.runtime.models.forEach(createNode);

  const typeDefs = compose.toSDL();
  const resolvers = compose.getResolveMethods();

  const schema = makeExecutableSchema({
    typeDefs: mergeTypeDefs([constraintDirectiveTypeDefs, typeDefs]),
    resolvers: mergeResolvers([
      ...input.runtime.models.map((x) => x.resolvers).filter(Boolean),
      resolvers,
    ]),
    schemaTransforms: [constraintDirective()],
  });

  return schema;
}

export = createValidationSchema;
