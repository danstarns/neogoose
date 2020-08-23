/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import parseTypeDefs from "../../src/utils/parse-type-defs";
import { print, parse } from "graphql";
import * as path from "path";

describe("utils/parseTypeDefs", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(parseTypeDefs).to.be.a("function");
    });

    it("should show cannot parse typedefs with invalid string SDL", () => {
      try {
        parseTypeDefs(`
            dkml,dnlk.djkl;jdkjk;ldjk
        `);

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.contain("cannot parse typeDefs");
      }
    });

    it("should show cannot parse typedefs with invalid file path", () => {
      try {
        parseTypeDefs("../../../../../random.gql");

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.contain("cannot parse typeDefs");
      }
    });

    it("should show cannot parse typedefs with invalid Object", () => {
      try {
        // @ts-ignore
        parseTypeDefs({ test: "test" });

        throw new Error("I should not throw");
      } catch (error) {
        expect(error.message).to.contain("cannot parse typeDefs");
      }
    });
  });

  describe("functionality", () => {
    it("should parse a string and return Document", () => {
      const typeDefs = `
            type User {
                name: string!
            }
          `;

      const document = parseTypeDefs(typeDefs);

      const printed = print(document);

      expect(printed).to.include("type User");
    });

    it("should parse a file path and return Document", () => {
      const document = parseTypeDefs(
        path.join(__dirname, "./parse-type-defs.gql")
      );

      const printed = print(document);

      expect(printed).to.include("type User");
    });

    it("should parse a Document and return Document", () => {
      const typeDefs = parse(`
            type User {
                name: string!
            }
      `);

      const document = parseTypeDefs(typeDefs);

      const printed = print(document);

      expect(printed).to.include("type User");
    });
  });
});
