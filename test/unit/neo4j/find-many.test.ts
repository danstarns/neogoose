import { expect } from "chai";
import { describe } from "mocha";
import findMany from "../../../src/neo4j/find-many";

describe("neo4j/findMany", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(findMany).to.be.a("function");
    });
  });
});
