import { expect } from "chai";
import { describe } from "mocha";
import connect from "../../../src/neo4j/connect";

describe("neo4j/connect", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(connect).to.be.a("function");
    });
  });
});
