/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import Connection from "../../src/classes/Connection";

describe("classes/Connection", () => {
  describe("validation", () => {
    it("should return a instance of Connection", () => {
      const connection = new Connection({
        // @ts-ignore
        config: {},
        // @ts-ignore
        driver: [],
      });

      expect(connection).to.be.a.instanceof(Connection);
    });
  });
});
