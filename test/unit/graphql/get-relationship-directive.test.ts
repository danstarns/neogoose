import { expect } from "chai";
import { describe } from "mocha";
import getRelationshipDirective from "../../../src/graphql/get-relationship-directive";
import { parse, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/getRelationshipDirective", () => {
  describe("functionality", () => {
    it("should return the validation directive", () => {
      const typeDefs = `
            type User {
                name: string! @Relationship(properties: UserPostCreatedProperties)
            }
          `;

      const document = parse(typeDefs);

      const node = document.definitions.find(
        (x) => x.kind === "ObjectTypeDefinition" && x.name.value === "User"
      ) as ObjectTypeDefinitionNode;

      const field = node.fields.find((field) => field.name.value === "name");

      const directive = getRelationshipDirective(field);

      expect(directive.kind).to.equal("Directive");
      expect(directive.name.value).to.equal("Relationship");
    });
  });
});
