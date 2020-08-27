import { expect } from "chai";
import { describe } from "mocha";
import createValidationSchema from "../../src/graphql/create-validation-schema";

describe("graphql/createValidationSchema", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createValidationSchema).to.be.a("function");
    });
  });
});
