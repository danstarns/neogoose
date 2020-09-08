import { expect } from "chai";
import { describe } from "mocha";
import updateOne from "../../../src/neo4j/update-one";

describe("neo4j/updateOne", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(updateOne).to.be.a("function");
    });
  });
});
