import { expect } from "chai";
import { describe } from "mocha";
import findOne from "../../../src/neo4j/find-one";

describe("neo4j/findOne", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(findOne).to.be.a("function");
    });
  });
});
