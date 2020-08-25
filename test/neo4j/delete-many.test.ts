import { expect } from "chai";
import { describe } from "mocha";
import deleteMany from "../../src/neo4j/delete-many";

describe("neo4j/deleteMany", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(deleteMany).to.be.a("function");
    });
  });
});
