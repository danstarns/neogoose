import { expect } from "chai";
import { describe } from "mocha";
import createValidationSchema from "../../src/graphql/create-validation-schema";
import model from "../../src/methods/model";
import { Runtime } from "../../src/types";
import { printSchema } from "graphql";

describe("graphql/createValidationSchema", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createValidationSchema).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should", () => {
      // @ts-ignore
      const runtime: Runtime = {
        // @ts-ignore
        models: [],
      };

      const _model = model(runtime);

      _model("User", {
        typeDefs: `   
          input UserProperties {
            name: String! @constraint(minLength: 5, format: "uid")
            abba: Boolean!
          }

          type Poo {
            type: String
          }

          type User {
            name: String!
            posts: [Post]! @Relationship(properties: UserProperties)
            mates: [User!] @Relationship(properties: UserProperties)
            poo: Poo
          }
        `,
      });

      _model("Post", {
        typeDefs: `   
          type Post {
            name: String!
            users: [User] @Relationship
          }
        `,
      });

      const schema = createValidationSchema({ runtime });

      console.log(printSchema(schema));
    });
  });
});
