/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import disconnect from "../../src/methods/disconnect";
import { Runtime } from "../../src/types";

describe("methods/disconnect", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(disconnect).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      const _disconnect = disconnect(runtime);

      expect(_disconnect).to.be.a("function");
    });
  });
});
