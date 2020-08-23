/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import model from "../../src/methods/model";
import { Runtime } from "../../src/types";
import { Model } from "../../src/classes";

describe("methods/model", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(model).to.be.a("function");
    });

    it("should throw name required", () => {
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      try {
        // @ts-ignore
        model(runtime)();

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.equal("name required");
      }
    });

    it("should throw options required", () => {
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      try {
        // @ts-ignore
        model(runtime)("User");

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.equal("options required");
      }
    });

    it("should throw options.typeDefs required", () => {
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      try {
        // @ts-ignore
        model(runtime)("User", {});

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.equal("options.typeDefs required");
      }
    });

    it("should return an instance of Model", () => {
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      const _model = model(runtime)("User", {
        typeDefs: `
          input UserValidation {
            name: String!
          }


          type User {
            name: String!
          }
        `,
      });

      expect(_model).to.be.a.instanceof(Model);
    });
  });
});
