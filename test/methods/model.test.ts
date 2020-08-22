/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import model from "../../src/methods/model";
import { Runtime } from "../../src/types";

describe("methods/model", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(model).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      const _model = model(runtime);

      expect(_model).to.be.a("function");
    });
  });
});
