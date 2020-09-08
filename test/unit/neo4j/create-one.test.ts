import { expect } from "chai";
import { describe } from "mocha";
import createOne from "../../../src/neo4j/create-one";

describe("neo4j/createOne", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createOne).to.be.a("function");
    });
  });
});
