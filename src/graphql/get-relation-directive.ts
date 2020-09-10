import { FieldDefinitionNode, DirectiveNode } from "graphql";

function getRelationDirective(field: FieldDefinitionNode): DirectiveNode {
  const found = field.directives.find(
    (direc) => direc.name.value === "relation"
  ) as DirectiveNode;

  return found;
}

export = getRelationDirective;
