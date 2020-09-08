import { expect } from "chai";
import { describe } from "mocha";
import createMany from "../../../src/neo4j/create-many";

describe("neo4j/createMany", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createMany).to.be.a("function");
    });
  });
});
