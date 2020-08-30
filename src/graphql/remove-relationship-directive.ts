import { ObjectTypeDefinitionNode } from "graphql";

function removeRelationshipDirective(
  node: ObjectTypeDefinitionNode
): ObjectTypeDefinitionNode {
  return {
    ...node,
    fields: node.fields.map((field) => ({
      ...field,
      directives: field.directives.filter(
        (x) => x.name.value !== "Relationship"
      ),
    })),
  };
}

export = removeRelationshipDirective;
