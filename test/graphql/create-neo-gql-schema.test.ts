import { expect } from "chai";
import { describe } from "mocha";
import createNeoGQLSchema from "../../src/graphql/create-neo-gql-schema";

describe("graphql/createNeoGQLSchema", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createNeoGQLSchema).to.be.a("function");
    });
  });
});
