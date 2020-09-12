import { expect } from "chai";
import { describe } from "mocha";
import createWhereAndParams from "../../../src/neo4j/create-where-and-params";
import { Model } from "../../../src/types";
import { generate } from "randomstring";
import proxyquire from "proxyquire";

describe("neo4j/createWhereAndParams", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(createWhereAndParams).to.be.a("function");
    });
  });

  describe("functionality", () => {
    it("should return correct where clause and params with 1 param", () => {
      const id = generate({
        charset: "alphabetic",
      });

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: { generate: () => id },
        }
      );

      // @ts-ignore
      const model: Model = {};

      const query = {
        id,
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE n.id = $node.${id}`);

      expect(w.params.node).to.deep.equal({ [id]: id });
    });

    it("should return correct where clause and params with 2 params", () => {
      const id = generate({
        charset: "alphabetic",
      });

      const id2 = generate({
        charset: "alphabetic",
      });

      const called = [];

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => {
              if (called.length) {
                return id2;
              }

              called.push(1);

              return id;
            },
          },
        }
      );

      const query = {
        id,
        name: "daniel",
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(
        `WHERE n.id = $node.${id} AND n.name = $node.${id2}`
      );

      expect(w.params.node).to.deep.equal({ [id]: id, [id2]: query.name });
    });

    it("should return correct where clause and params with $in", () => {
      const id = generate({
        charset: "alphabetic",
      });

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => id,
          },
        }
      );

      const query = {
        id: {
          $in: [id],
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE ( n.id IN $node.${id})`);

      expect(w.params.node).to.deep.equal({ [id]: query.id.$in });
    });

    it("should return correct where clause and params with $in and 1 other param", () => {
      const id = generate({
        charset: "alphabetic",
      });

      const id2 = generate({
        charset: "alphabetic",
      });

      const called = [];

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => {
              if (called.length) {
                return id2;
              }

              called.push(1);

              return id;
            },
          },
        }
      );

      const query = {
        name: "Daniel",
        id: {
          $in: [id],
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(
        `WHERE n.name = $node.${id} AND ( n.id IN $node.${id2})`
      );

      expect(w.params.node).to.deep.equal({
        [id]: query.name,
        [id2]: query.id.$in,
      });
    });

    it("should return correct where clause and params with $regex", () => {
      const id = generate({
        charset: "alphabetic",
      });

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => id,
          },
        }
      );

      const regex = `(?i)AND.*`;

      const query = {
        id: {
          $regex: regex,
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE ( n.id =~ $node.${id})`);

      expect(w.params.node).to.deep.equal({ [id]: query.id.$regex });
    });

    it("should return correct where clause and params with $regex and 1 other param", () => {
      const id = generate({
        charset: "alphabetic",
      });

      const id2 = generate({
        charset: "alphabetic",
      });

      const called = [];

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => {
              if (called.length) {
                return id2;
              }

              called.push(1);

              return id;
            },
          },
        }
      );

      const regex = `(?i)AND.*`;

      const query = {
        name: "Daniel",
        id: {
          $regex: regex,
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(
        `WHERE n.name = $node.${id} AND ( n.id =~ $node.${id2})`
      );

      expect(w.params.node).to.deep.equal({
        [id]: query.name,
        [id2]: regex,
      });
    });

    it("should return correct where clause and params with $eq", () => {
      const id = generate({
        charset: "alphabetic",
      });

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => id,
          },
        }
      );

      const query = {
        id: {
          $eq: id,
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE ( n.id = $node.${id})`);

      expect(w.params.node).to.deep.equal({ [id]: id });
    });

    it("should return correct where clause and params with $gt", () => {
      const id = generate({
        charset: "alphabetic",
      });

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => id,
          },
        }
      );

      const query = {
        id: {
          $gt: id,
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE ( n.id > $node.${id})`);

      expect(w.params.node).to.deep.equal({ [id]: id });
    });

    it("should return correct where clause and params with $gte", () => {
      const id = generate({
        charset: "alphabetic",
      });

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => id,
          },
        }
      );

      const query = {
        id: {
          $gte: id,
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE ( n.id >= $node.${id})`);

      expect(w.params.node).to.deep.equal({ [id]: id });
    });

    it("should return correct where clause and params with $lt", () => {
      const id = generate({
        charset: "alphabetic",
      });

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => id,
          },
        }
      );

      const query = {
        id: {
          $lt: id,
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE ( n.id < $node.${id})`);

      expect(w.params.node).to.deep.equal({ [id]: id });
    });

    it("should return correct where clause and params with $lte", () => {
      const id = generate({
        charset: "alphabetic",
      });

      // @ts-ignore
      const model: Model = {};

      const createWhereAndParams = proxyquire(
        "../../../src/neo4j/create-where-and-params",
        {
          randomstring: {
            generate: () => id,
          },
        }
      );

      const query = {
        id: {
          $lte: id,
        },
      };

      const w = createWhereAndParams({ model, query });

      expect(w.where).to.contain(`WHERE ( n.id <= $node.${id})`);

      expect(w.params.node).to.deep.equal({ [id]: id });
    });
  });
});
