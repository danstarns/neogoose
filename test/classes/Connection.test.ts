/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import Connection from "../../src/classes/Model";

describe("classes/Connection", () => {
  describe("validation", () => {
    it("should return a instance of Connection", () => {
      const connection = new Connection();

      expect(connection).to.be.a.instanceof(Connection);
    });
  });
});
