/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import { Runtime } from "../../src/types";
import proxyquire from "proxyquire";
import { Connection } from "../../src/classes";

const connect = proxyquire("../../src/methods/connect.ts", {
  "../neo4j": {
    connect: () => ({}),
  },
});

describe("methods/connect", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(connect).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      const _connect = connect(runtime);

      expect(_connect).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should connect and return a instance", async () => {
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      const _connect = connect(runtime);

      const connection = await _connect("neo4j://localhost");

      expect(connection).to.be.a.instanceof(Connection);

      expect(runtime.connection).to.equal(connection);
    });
  });
});
