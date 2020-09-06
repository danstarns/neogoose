import {
  GraphQLSchema,
  ObjectTypeExtensionNode,
  ObjectTypeDefinitionNode,
  DirectiveNode,
  print,
  DocumentNode,
} from "graphql";
import { Runtime, AugmentOptions } from "../types";
import { makeAugmentedSchema } from "neo4j-graphql-js";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";

function transformDirectiveToNeo4jGQL(directive: DirectiveNode): DirectiveNode {
  if (directive.name.value === "Relationship") {
    return {
      ...directive,
      name: {
        ...directive.name,
        value: "relation",
      },
      arguments: directive.arguments
        .filter((arg) => arg.name.value !== "properties")
        .map((arg) => {
          if (arg.name.value === "label") {
            return {
              ...arg,
              name: {
                ...arg.name,
                value: "name",
              },
            };
          }

          return arg;
        }),
    };
  }

  return directive;
}

function transformDefinitionToNeo4jGQL(
  definition: ObjectTypeDefinitionNode | ObjectTypeExtensionNode
): ObjectTypeDefinitionNode | ObjectTypeExtensionNode {
  return {
    ...definition,
    fields: definition.fields.map((field) => ({
      ...field,
      directives: field.directives
        .map(transformDirectiveToNeo4jGQL)
        .filter((x) => x.name.value !== "constraint"),
    })),
    directives: definition.directives.filter(
      (directive) => directive.name.value !== "Validation"
    ),
  };
}

function createNeoGQLSchema(input: {
  runtime: Runtime;
  options: AugmentOptions;
}): GraphQLSchema {
  const document: DocumentNode = { kind: "Document", definitions: [] };
  const resolvers = [];

  input.runtime.models.forEach((model) => {
    if (model.resolvers) {
      resolvers.push(model.resolvers);
    }

    model.document.definitions.forEach((def) => {
      switch (def.kind) {
        case "ObjectTypeDefinition":
        case "ObjectTypeExtension":
          {
            // @ts-ignore
            document.definitions.push(transformDefinitionToNeo4jGQL(def));
          }
          break;

        default:
          // @ts-ignore
          document.definitions.push(def);
      }
    });
  });

  const typeDefs = print(document);

  const schema = makeAugmentedSchema({
    typeDefs: mergeTypeDefs([
      typeDefs,
      ...(input.options.typeDefs ? [input.options.typeDefs] : []),
    ]),
    resolvers: mergeResolvers([
      ...resolvers,
      ...(input.options.resolvers ? [input.options.resolvers] : []),
    ]),
  });

  return schema;
}

export = createNeoGQLSchema;
