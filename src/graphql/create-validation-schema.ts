import { GraphQLSchema, print } from "graphql";
import { Runtime } from "../types";
import { Model } from "../classes";
import { ObjectTypeComposer, SchemaComposer } from "graphql-compose";
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

    if (model.properties) {
      const name = model.properties.name.value;

      const typeDefs = print({
        kind: "Document",
        definitions: [model.properties],
      });

      compose.createInputTC(typeDefs.replace(name, `${model.name}_Input`));
    } else {
      compose.createInputTC({
        name: `${model.name}_Input`,
        fields: {
          ...composeFields,
        },
      });
    }

    compose.Query.addFields({
      [`${model.name}InputOne`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `${model.name}_Input`,
        },
      },
      [`${model.name}InputMany`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `[${model.name}_Input]`,
        },
      },
    });

    compose.Query.addFields({
      [`${model.name}Update`]: {
        type: "Boolean",
        resolve: () => true,
        args: {
          input: `${model.name}_Input`,
        },
      },
      [`${model.name}OutputOne`]: {
        type: model.name,
        resolve: (root, args, ctx: any) => ctx.input,
      },
      [`${model.name}OutputMany`]: {
        type: `[${model.name}]!`,
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
      ...input.runtime.models
        .map((x) => {
          if (!x.resolvers) {
            return false;
          }

          return Object.entries(x.resolvers).reduce(
            (r, [k, v]) =>
              !["Query", "Mutation", "Subscription"].includes(k)
                ? { ...r, [k]: v }
                : r,
            {}
          );
        })
        .filter(Boolean),
      resolvers,
    ]),
    schemaTransforms: [constraintDirective()],
  });

  return schema;
}

export = createValidationSchema;
