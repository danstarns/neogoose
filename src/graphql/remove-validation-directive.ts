/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DocumentNode } from "graphql";

function removeValidationDirective(document: DocumentNode): DocumentNode {
  document.definitions.forEach((def) => {
    if (def.kind === "ObjectTypeDefinition") {
      // @ts-ignore
      def.directives = def.directives.filter(
        (direc) => direc.name.value !== "Validation"
      );
    }
  });

  return document;
}

export = removeValidationDirective;
