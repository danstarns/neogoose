/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import removeValidationDirective from "../../../src/graphql/remove-validation-directive";
import { parse, print } from "graphql";

describe("graphql/removeValidationDirective", () => {
  describe("functionality", () => {
    it("should remove validation directive", () => {
      const typeDefs = `
            type User @Validation @Validation {
                name: string!
            }
          `;

      const document = parse(typeDefs);

      const removed = removeValidationDirective(document);

      expect(print(removed)).to.not.include("@Validation");
    });
  });
});
