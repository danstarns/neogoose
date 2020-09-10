import { expect } from "chai";
import { describe } from "mocha";
import createWhereAndParams from "../../../src/neo4j/create-where-and-params";
import { Model } from "../../../src/types";
import { generate } from "randomstring";

describe("neo4j/createWhereAndParams", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createWhereAndParams).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should return correct where clause and params with 1 param", () => {
      // @ts-ignore
      const model: Model = {};

      const query = {
        id: generate({
          charset: "alphabetic",
        }),
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain("WHERE n.id = $node.id");

      expect(w.params.node).to.deep.equal(query);
    });

    it("should return correct where clause and params with 2 params", () => {
      // @ts-ignore
      const model: Model = {};

      const query = {
        id: generate({
          charset: "alphabetic",
        }),
        name: "daniel",
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(
        "WHERE n.id = $node.id AND n.name = $node.name"
      );

      expect(w.params.node).to.deep.equal(query);
    });

    it("should return correct where clause and params with $in", () => {
      // @ts-ignore
      const model: Model = {};

      const id = generate({
        charset: "alphabetic",
      });

      const query = {
        id: {
          $in: [id],
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain("WHERE n.id IN $node.id");

      expect(w.params.node).to.deep.equal({ id: query.id.$in });
    });

    it("should return correct where clause and params with $in and 1 other param", () => {
      // @ts-ignore
      const model: Model = {};

      const id = generate({
        charset: "alphabetic",
      });

      const query = {
        name: "Daniel",
        id: {
          $in: [id],
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(
        "WHERE n.name = $node.name AND n.id IN $node.id"
      );

      expect(w.params.node).to.deep.equal({
        id: query.id.$in,
        name: query.name,
      });
    });
  });
});
