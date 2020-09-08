/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import getValidationDirective from "../../../src/graphql/get-validation-directive";
import { parse, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/getValidationDirective", () => {
  describe("functionality", () => {
    it("should return the validation directive", () => {
      const typeDefs = `
            type User @Validation {
                name: string!
            }
          `;

      const document = parse(typeDefs);

      const directive = getValidationDirective(
        document.definitions.find(
          (x) => x.kind === "ObjectTypeDefinition" && x.name.value === "User"
        ) as ObjectTypeDefinitionNode
      );

      expect(directive.kind).to.equal("Directive");
      expect(directive.name.value).to.equal("Validation");
    });
  });
});
