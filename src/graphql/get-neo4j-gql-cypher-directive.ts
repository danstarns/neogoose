import { FieldDefinitionNode, DirectiveNode } from "graphql";

function getNeo4jCypherDirective(field: FieldDefinitionNode): DirectiveNode {
  const found = field.directives.find(
    (direc) => direc.name.value === "cypher"
  ) as DirectiveNode;

  return found;
}

export = getNeo4jCypherDirective;
