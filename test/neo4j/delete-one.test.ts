import { expect } from "chai";
import { describe } from "mocha";
import deleteOne from "../../src/neo4j/delete-one";

describe("neo4j/deleteOne", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(deleteOne).to.be.a("function");
    });
  });
});
