/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import getFieldTypeName from "../../src/graphql/get-field-type-name";
import { parse, ObjectTypeDefinitionNode } from "graphql";

describe("graphql/getFieldTypeName", () => {
  describe("functionality", () => {
    it("should return NonNullType ListType type name", () => {
      const typeDefs = `
            type User {
                name: [ABC]!
            }
          `;

      const node = parse(typeDefs).definitions[0] as ObjectTypeDefinitionNode;

      const field = node.fields[0];

      const res = getFieldTypeName(field);

      expect(res).to.deep.equal({
        name: "ABC",
        required: true,
        array: true,
        pretty: "[ABC]!",
        prettyBy: res.prettyBy,
      });
    });

    it("should return NonNullType NamedType type name", () => {
      const typeDefs = `
            type User {
                name: ABC!
            }
          `;

      const node = parse(typeDefs).definitions[0] as ObjectTypeDefinitionNode;

      const field = node.fields[0];

      const res = getFieldTypeName(field);

      expect(res).to.deep.equal({
        name: "ABC",
        required: true,
        array: false,
        pretty: "ABC!",
        prettyBy: res.prettyBy,
      });
    });

    it("should return NamedType type name", () => {
      const typeDefs = `
            type User {
                name: String
            }
          `;

      const node = parse(typeDefs).definitions[0] as ObjectTypeDefinitionNode;

      const field = node.fields[0];

      const res = getFieldTypeName(field);

      expect(res).to.deep.equal({
        name: "String",
        required: false,
        array: false,
        pretty: "String",
        prettyBy: res.prettyBy,
      });
    });

    it("should return ListType NamedType type name", () => {
      const typeDefs = `
            type User {
                name: [ABC]
            }
          `;

      const node = parse(typeDefs).definitions[0] as ObjectTypeDefinitionNode;

      const field = node.fields[0];

      const res = getFieldTypeName(field);

      expect(res).to.deep.equal({
        name: "ABC",
        required: false,
        array: true,
        pretty: "[ABC]",
        prettyBy: res.prettyBy,
      });
    });

    it("should return ListType NonNullType type name", () => {
      const typeDefs = `
            type User {
                name: [ABC!]
            }
          `;

      const node = parse(typeDefs).definitions[0] as ObjectTypeDefinitionNode;

      const field = node.fields[0];

      const res = getFieldTypeName(field);

      expect(res).to.deep.equal({
        name: "ABC",
        required: true,
        array: true,
        pretty: "[ABC!]",
        prettyBy: res.prettyBy,
      });
    });
  });
});
