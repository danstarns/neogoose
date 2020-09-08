/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import Model from "../../../src/classes/Model";

describe("classes/Model", () => {
  describe("validation", () => {
    it("should return a instance of Model", () => {
      const model = new Model({
        name: "User",
        // @ts-ignore
        document: {},
      });

      expect(model).to.be.a.instanceof(Model);
    });

    it("should have the correct methods", () => {
      const model = new Model({
        name: "User",
        // @ts-ignore
        document: {},
      });

      expect(model).to.have.property("createOne").to.be.a("function");
      expect(model).to.have.property("createMany").to.be.a("function");
      expect(model).to.have.property("findOne").to.be.a("function");
      expect(model).to.have.property("findMany").to.be.a("function");
      expect(model).to.have.property("updateOne").to.be.a("function");
      expect(model).to.have.property("updateMany").to.be.a("function");
      expect(model).to.have.property("deleteOne").to.be.a("function");
      expect(model).to.have.property("deleteMany").to.be.a("function");
    });
  });
});
