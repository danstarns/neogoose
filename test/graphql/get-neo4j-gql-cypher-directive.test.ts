import { expect } from "chai";
import { describe } from "mocha";
import getNeo4jCypherDirective from "../../src/graphql/get-neo4j-gql-cypher-directive";
import { parse, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/getNeo4jCypherDirective", () => {
  describe("functionality", () => {
    it("should return the cypher directive", () => {
      const typeDefs = `
            type User {
                name: string! @cypher
            }
          `;

      const document = parse(typeDefs);

      const node = document.definitions.find(
        (x) => x.kind === "ObjectTypeDefinition" && x.name.value === "User"
      ) as ObjectTypeDefinitionNode;

      const field = node.fields.find((field) => field.name.value === "name");

      const directive = getNeo4jCypherDirective(field);

      expect(directive.kind).to.equal("Directive");
      expect(directive.name.value).to.equal("cypher");
    });
  });
});
