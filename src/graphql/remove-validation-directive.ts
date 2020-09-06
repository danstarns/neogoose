/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DocumentNode } from "graphql";

function removeValidationDirective(document: DocumentNode): DocumentNode {
  return {
    ...document,
    definitions: document.definitions.map((def) => {
      if (def.kind === "ObjectTypeDefinition") {
        return {
          ...def,
          directives: def.directives.filter(
            (direc) => direc.name.value !== "Validation"
          ),
        };
      }
    }),
  };
}

export = removeValidationDirective;
