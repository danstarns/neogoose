/* eslint-disable @typescript-eslint/no-empty-function */
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
      // @ts-ignore
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      const _disconnect = disconnect(runtime);

      expect(_disconnect).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should call close and null the connection", async () => {
      // @ts-ignore
      const runtime: Runtime = {
        models: [],
        connections: [],
        // @ts-ignore
        connection: { driver: { close: () => {} } },
      };

      const _disconnect = disconnect(runtime);

      await _disconnect();

      expect(runtime.connection).to.equal(null);
    });
  });
});
