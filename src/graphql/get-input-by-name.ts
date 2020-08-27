import { DocumentNode, InputObjectTypeDefinitionNode } from "graphql";

function getInputByName(input: {
  document: DocumentNode;
  name: string;
}): InputObjectTypeDefinitionNode {
  const found = input.document.definitions.find(
    (x) => x.kind === "InputObjectTypeDefinition" && x.name.value === input.name
  ) as InputObjectTypeDefinitionNode;

  return found;
}

export = getInputByName;
