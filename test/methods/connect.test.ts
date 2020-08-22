/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import connect from "../../src/methods/connect";
import { Runtime } from "../../src/types";

describe("methods/connect", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(connect).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      const runtime: Runtime = {};

      const _connect = connect(runtime);

      expect(_connect).to.be.a("function");
    });
  });
});
