import { expect } from "chai";
import { describe } from "mocha";
import createValidationSchema from "../../../src/graphql/create-validation-schema";
import model from "../../../src/methods/model";
import { Runtime } from "../../../src/types";
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
          input UserPostProperties {
            name: String! @constraint(minLength: 5, format: "uid")
            abba: Boolean!
          }

          input UserProperties {
            name: String! @constraint(minLength: 5, format: "uid")
            date: DateTime!
          }

          scalar DateTime

          type Nested {
            type: String
          }

          type User @Validation(properties: UserProperties) {
            name: String! @id
            posts: [Post]! @Relationship(properties: UserPostProperties)
            mates: [User!] @Relationship(properties: UserPostProperties)
            nested: Nested
            date: DateTime
            test: [Post] @cypher
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

      const printed = printSchema(schema);

      expect(printed).to.not.contain("@id");
      expect(printed).to.not.contain("@cypher");
      expect(printed).to.not.contain("@Relationship");
      expect(printed).to.not.contain("@cypher");
      expect(printed).to.not.contain("@Validation");

      expect(printed).to.include("input User_posts_Properties");
      expect(printed).to.include("input User_posts_Input");
      expect(printed).to.include("input User_mates_Properties");
      expect(printed).to.include("input User_mates_Input");
      expect(printed).to.include("input User_Input");
      expect(printed).to.include("type User");
      expect(printed).to.include("input Post_users_Input");
      expect(printed).to.include("input Post_Input");
      expect(printed).to.include("type Post");
      expect(printed).to.include("type Nested");
      expect(printed).to.include("scalar DateTime");
      expect(printed).to.include("directive @constraint");
    });
  });
});
