/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import createConnection from "../../src/methods/create-connection";
import { Runtime } from "../../src/types";

describe("methods/createConnection", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createConnection).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      const runtime: Runtime = {};

      const _createConnection = createConnection(runtime);

      expect(_createConnection).to.be.a("function");
    });
  });
});
