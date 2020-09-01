import { expect } from "chai";
import { describe } from "mocha";
import createValidationSchema from "../../src/graphql/create-validation-schema";
import { Runtime } from "../../src/types";
import { parse, ObjectTypeDefinitionNode, printSchema } from "graphql";

describe("graphql/createValidationSchema", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createValidationSchema).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should", () => {
      const postDocument = parse(`
          type Post {
            name: String!
            users: [User] @Relationship
          }
      `);

      const postNode = postDocument.definitions[0];

      const userDocument = parse(`
          input UserProperties {
            name: String! @constraint(minLength: 5, format: "uid")
            abba: Boolean!
          }

          type User {
            name: String!
            posts: [Post]! @Relationship(properties: UserProperties)
            mates: [User!] @Relationship(properties: UserProperties)
          }
      `);

      const userNode = userDocument.definitions.find(
        (x: ObjectTypeDefinitionNode) => x.name.value === "User"
      );

      const user = {
        name: "User",
        node: userNode,
        document: userDocument,
        inputs: {},
      };

      const post = {
        name: "Post",
        node: postNode,
        document: postDocument,
        inputs: {},
      };

      // @ts-ignore
      const runtime: Runtime = {
        // @ts-ignore
        models: [user, post],
      };

      const schema = createValidationSchema({ runtime });

      console.log(printSchema(schema));
    });
  });
});
