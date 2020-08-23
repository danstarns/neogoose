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

    it("should throw model name conflict", () => {
      const runtime: Runtime = {
        // @ts-ignore
        models: [{ name: "User" }],
        connections: [],
      };

      try {
        model(runtime)("User", {
          typeDefs: `
            input UserValidation {
              name: String!
            }
  
  
            type User {
              name: String!
            }
          `,
        });

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.equal(`Model name: 'User' conflict`);
      }
    });

    it("should throw typeDefs requires type User", () => {
      const runtime: Runtime = {
        models: [],
        connections: [],
      };

      try {
        model(runtime)("User", {
          typeDefs: `
            input UserValidation {
              name: String!
            }
  
            type NotUser {
              name: String!
            }
          `,
        });

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.equal(
          `typeDefs requires 'type User'/ObjectTypeDefinition`
        );
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

  describe("functionality", () => {
    it("should return an instance of Model if only string is passed", () => {
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      //@ts-ignore
      const _model = model(runtime);

      const user = _model("User", {
        typeDefs: `
        input UserValidation {
          name: String!
        }


        type User {
          name: String!
        }
      `,
      });

      expect(user).to.equal(_model("User"));
      expect(_model("User")).to.equal(_model("User"));
    });
  });
});
