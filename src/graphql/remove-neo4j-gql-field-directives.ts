import { FieldDefinitionNode } from "graphql";

const internalDirectives = [
  "relation",
  "id",
  "unique",
  "index",
  "cypher",
  "neo4j_ignore",
  "additionalLabels",
  "isAuthenticated",
  "hasRole",
  "hasScope",
];

function removeNeo4jGQLFieldDirectives(
  field: FieldDefinitionNode
): FieldDefinitionNode {
  return {
    ...field,
    directives: field.directives.filter(
      (x) => !internalDirectives.includes(x.name.value)
    ),
  };
}

export = removeNeo4jGQLFieldDirectives;
