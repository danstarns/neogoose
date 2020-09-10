import { expect } from "chai";
import { describe } from "mocha";
import getRelationDirective from "../../../src/graphql/get-relation-directive";
import { parse, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/getRelationDirective", () => {
  describe("functionality", () => {
    it("should return the validation directive", () => {
      const typeDefs = `
            type User {
                name: string! @relation
            }
          `;

      const document = parse(typeDefs);

      const node = document.definitions.find(
        (x) => x.kind === "ObjectTypeDefinition" && x.name.value === "User"
      ) as ObjectTypeDefinitionNode;

      const field = node.fields.find((field) => field.name.value === "name");

      const directive = getRelationDirective(field);

      expect(directive.kind).to.equal("Directive");
      expect(directive.name.value).to.equal("relation");
    });
  });
});
