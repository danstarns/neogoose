/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import removeRelationshipDirective from "../../../src/graphql/remove-relation-directive";
import { parse, print, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/removeRelationshipDirective", () => {
  describe("functionality", () => {
    it("should remove relationship directive", () => {
      const typeDefs = `
            type User {
                name: String! @relation @relation
            }
          `;

      const document = parse(typeDefs);

      const node = document.definitions[0] as ObjectTypeDefinitionNode;

      const n = removeRelationshipDirective(node);

      expect(print({ kind: "Document", definitions: [n] })).to.not.include(
        "@relation"
      );
    });
  });
});
