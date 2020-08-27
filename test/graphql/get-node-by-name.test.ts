/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import getNodeByName from "../../src/graphql/get-node-by-name";
import { parse } from "graphql";

describe("graphql/getNodeByName", () => {
  describe("functionality", () => {
    it("should return a node by its name", () => {
      const typeDefs = `
            type User {
                name: string!
            }
          `;

      const document = parse(typeDefs);

      const node = getNodeByName({ document, name: "User" });

      expect(node.name.value).to.equal("User");
    });
  });
});
