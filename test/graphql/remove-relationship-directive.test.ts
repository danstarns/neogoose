/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import removeRelationshipDirective from "../../src/graphql/remove-relationship-directive";
import { parse, print, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/removeRelationshipDirective", () => {
  describe("functionality", () => {
    it("should remove relationship directive", () => {
      const typeDefs = `
            type User {
                name: String! @Relationship @Relationship
            }
          `;

      const document = parse(typeDefs);

      const node = document.definitions[0] as ObjectTypeDefinitionNode;

      removeRelationshipDirective(node);

      expect(print({ kind: "Document", definitions: [node] })).to.not.include(
        "@Validation"
      );
    });
  });
});
