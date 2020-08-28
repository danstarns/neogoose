import { FieldDefinitionNode, DirectiveNode } from "graphql";

function getRelationshipDirective(field: FieldDefinitionNode): DirectiveNode {
  const found = field.directives.find(
    (direc) => direc.name.value === "Relationship"
  ) as DirectiveNode;

  return found;
}

export = getRelationshipDirective;
