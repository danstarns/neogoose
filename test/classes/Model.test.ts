/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import Model from "../../src/classes/Model";

describe("classes/Model", () => {
  describe("validation", () => {
    it("should return a instance of Model", () => {
      const model = new Model();

      expect(model).to.be.a.instanceof(Model);
    });
  });
});
