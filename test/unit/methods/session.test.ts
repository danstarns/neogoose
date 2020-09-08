/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import session from "../../../src/methods/session";
import { Runtime } from "../../../src/types";

describe("methods/session", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(session).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      // @ts-ignore
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      const _session = session(runtime);

      expect(_session).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should return null if no connection", async () => {
      // @ts-ignore
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      const _session = session(runtime);

      const sesh = await _session();

      expect(sesh).to.equal(null);
    });

    it("should return the call of driver.session();", async () => {
      // @ts-ignore
      const runtime: Runtime = {
        models: [],
        connections: [],
        // @ts-ignore
        connection: { driver: { session: () => ({ test: "test" }) } },
      };

      const _session = session(runtime);

      const sesh = await _session();

      expect(sesh).to.deep.equal({ test: "test" });
    });
  });
});
