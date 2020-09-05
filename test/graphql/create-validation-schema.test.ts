import { expect } from "chai";
import { describe } from "mocha";
import createValidationSchema from "../../src/graphql/create-validation-schema";
import getRelationshipDirective from "../../src/graphql/get-relationship-directive";
import { Runtime } from "../../src/types";
import {
  parse,
  ObjectTypeDefinitionNode,
  printSchema,
  FieldDefinitionNode,
} from "graphql";

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

      const postNode = postDocument.definitions[0] as ObjectTypeDefinitionNode;

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
      ) as ObjectTypeDefinitionNode;

      const userFields = userNode.fields.reduce(
        (res, field) => {
          const relationshipDirective = getRelationshipDirective(field);

          if (relationshipDirective) {
            res.relations.push(field);
          } else {
            res.fields.push(field);
          }

          return res;
        },
        { relations: [], fields: [] }
      ) as {
        relations: FieldDefinitionNode[];
        fields: FieldDefinitionNode[];
      };

      const postFields = postNode.fields.reduce(
        (res, field) => {
          const relationshipDirective = getRelationshipDirective(field);

          if (relationshipDirective) {
            res.relations.push(field);
          } else {
            res.fields.push(field);
          }

          return res;
        },
        { relations: [], fields: [] }
      ) as {
        relations: FieldDefinitionNode[];
        fields: FieldDefinitionNode[];
      };

      const user = {
        name: "User",
        node: userNode,
        document: userDocument,
        inputs: {},
        fields: userFields.fields,
        relations: userFields.relations,
      };

      const post = {
        name: "Post",
        node: postNode,
        document: postDocument,
        inputs: {},
        fields: postFields.fields,
        relations: postFields.relations,
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
