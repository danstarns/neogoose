import { expect } from "chai";
import { describe } from "mocha";
import removeNeo4jGQLFieldDirectives from "../../../src/graphql/remove-neo4j-gql-field-directives";
import { parse, print, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/removeNeo4jGQLFieldDirectives", () => {
  describe("functionality", () => {
    it("should remove relationship directive", () => {
      const typeDefs = `
            type User {
                one: String!
                two: String! @relation
                three: String! @id
                four: String! @unique
                five: String! @index
                six: String! @cypher
                seven: String! @neo4j_ignore
                eight: String! @additionalLabels
                nine: String! @isAuthenticated
                ten: String! @hasRole
                eleven: String! @hasScope
            }
          `;

      const document = parse(typeDefs);

      const node = document.definitions[0] as ObjectTypeDefinitionNode;

      const newNode = {
        ...node,
        fields: node.fields.map(removeNeo4jGQLFieldDirectives),
      };

      const internalDirectives = [
        "relation",
        "id",
        "unique",
        "index",
        "cypher",
        "neo4j_ignore",
        "additionalLabels",
        "isAuthenticated",
        "hasRole",
        "hasScope",
      ];

      const printed = print({ kind: "Document", definitions: [newNode] });

      internalDirectives.forEach((direc) => {
        expect(printed).to.not.include(`@${direc}`);
      });
    });
  });
});
