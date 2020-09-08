import { expect } from "chai";
import { describe } from "mocha";
import updateMany from "../../../src/neo4j/update-many";

describe("neo4j/updateMany", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(updateMany).to.be.a("function");
    });
  });
});
