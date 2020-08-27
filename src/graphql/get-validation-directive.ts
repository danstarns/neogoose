import { ObjectTypeDefinitionNode, DirectiveNode } from "graphql";

function getValidationDirective(node: ObjectTypeDefinitionNode): DirectiveNode {
  const found = node.directives.find(
    (direc) => direc.name.value === "Validation"
  ) as DirectiveNode;

  return found;
}

export = getValidationDirective;
