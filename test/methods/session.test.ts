/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import session from "../../src/methods/session";
import { Runtime } from "../../src/types";

describe("methods/session", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(session).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      const _session = session(runtime);

      expect(_session).to.be.a("function");
    });
  });
});
