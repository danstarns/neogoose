/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import getInputByName from "../../src/graphql/get-input-by-name";
import { parse } from "graphql";

describe("graphql/getInputByName", () => {
  describe("functionality", () => {
    it("should return an input by its name", () => {
      const typeDefs = `
            input UserInput {
                name: String!
            }

            type User {
                name: String!
            }
          `;

      const input = getInputByName({
        name: "UserInput",
        document: parse(typeDefs),
      });

      expect(input.name.value).to.equal("UserInput");
      expect(input.kind).to.equal("InputObjectTypeDefinition");
    });
  });
});
