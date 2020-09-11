import { expect } from "chai";
import { describe } from "mocha";
import count from "../../../src/neo4j/count";

describe("neo4j/count", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(count).to.be.a("function");
    });
  });
});
