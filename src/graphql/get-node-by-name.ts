import { DocumentNode, ObjectTypeDefinitionNode } from "graphql";

function getNodeByName(input: {
  document: DocumentNode;
  name: string;
}): ObjectTypeDefinitionNode {
  const found = input.document.definitions.find(
    (x) => x.kind === "ObjectTypeDefinition" && x.name.value === input.name
  ) as ObjectTypeDefinitionNode;

  return found;
}

export = getNodeByName;
