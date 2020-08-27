/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import { Runtime } from "../../src/types";
import proxyquire from "proxyquire";
import { Connection } from "../../src/classes";

const createConnection = proxyquire("../../src/methods/create-connection.ts", {
  "../neo4j": {
    connect: () => ({}),
  },
});

describe("methods/createConnection", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createConnection).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      // @ts-ignore
      const runtime: Runtime = {
        connections: [],
        models: [],
      };
      const _createConnection = createConnection(runtime);

      expect(_createConnection).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should connect and return a instance", async () => {
      // @ts-ignore
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      const _createConnection = createConnection(runtime);

      const connection = await _createConnection("neo4j://localhost");

      expect(connection).to.be.a.instanceof(Connection);

      expect(runtime.connections[0]).to.equal(connection);
    });
  });
});
