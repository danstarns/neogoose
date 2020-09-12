import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("findMany", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("should findMany by id", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $id}), (:User {id: $id}), (:User {id: $id})
    `;

    try {
      await session.run(createCypher, {
        id,
      });

      const found = await User.findMany({ id });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.equal(id);
      });

      const deleteCypher = `
        MATCH (n:User {id: $id})
        DELETE n
      `;

      await session.run(deleteCypher, { id });

      const reFind = await User.findMany({ id });

      expect(reFind.length).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany $in ids", async () => {
    const id1 = generate({
      charset: "alphabetic",
    });
    const id2 = generate({
      charset: "alphabetic",
    });
    const id3 = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $id1}), (:User {id: $id2}), (:User {id: $id2})
    `;

    try {
      await session.run(createCypher, {
        id1,
        id3,
        id2,
      });

      const found = await User.findMany({ id: { $in: [id1, id2, id3] } });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.be.oneOf([id1, id2, id3]);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id IN [$id1, $id2, $id3]
        DELETE n
      `;

      await session.run(deleteCypher, {
        id1,
        id3,
        id2,
      });

      const reFind = await User.findMany({ id: { $in: [id1, id2, id3] } });

      expect(reFind.length).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany $in ids with 1 other param", async () => {
    const id1 = generate({
      charset: "alphabetic",
    });
    const id2 = generate({
      charset: "alphabetic",
    });
    const id3 = generate({
      charset: "alphabetic",
    });

    const name = "Daniel";

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $id1, name: $name}), (:User {id: $id2, name: $name}), (:User {id: $id3, name: $name})
    `;

    try {
      await session.run(createCypher, {
        id1,
        id2,
        id3,
        name,
      });

      const found = await User.findMany({ id: { $in: [id1, id2, id3] } });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.be.oneOf([id1, id2, id3]);
        expect(node.name).to.be.equal(name);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id IN [$id1, $id2, $id3]
        DELETE n
      `;

      await session.run(deleteCypher, {
        id1,
        id3,
        id2,
      });

      const reFind = await User.findMany({ id: { $in: [id1, id2, id3] } });

      expect(reFind.length).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany with $regex", async () => {
    const id1 = generate({
      charset: "alphabetic",
    });

    const join =
      id1 +
      generate({
        charset: "alphabetic",
      });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $join}), (:User {id: $join}), (:User {id: $join})
    `;

    try {
      await session.run(createCypher, {
        join,
      });

      const regex = `(?i)${id1}.*`;

      const found = await User.findMany({
        id: { $regex: regex },
      });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.include(id1);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id STARTS WITH $id1
        DELETE n
      `;

      await session.run(deleteCypher, {
        id1,
      });

      const reFind = await User.findMany({
        id: { $regex: regex },
      });

      expect(reFind.length).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany with $regex with 1 other param", async () => {
    const id1 = generate({
      charset: "alphabetic",
    });

    const name = "Daniel";

    const join =
      id1 +
      generate({
        charset: "alphabetic",
      });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $join, name: $name}), (:User {id: $join, name: $name}), (:User {id: $join, name: $name})
    `;

    try {
      await session.run(createCypher, {
        join,
        name,
      });

      const regex = `(?i)${id1}.*`;

      const found = await User.findMany({
        id: { $regex: regex },
        name,
      });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.include(id1);
        expect(node.name).to.include(name);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id STARTS WITH $id1
        DELETE n
      `;

      await session.run(deleteCypher, {
        id1,
      });

      const reFind = await User.findMany({
        id: { $regex: regex },
      });

      expect(reFind.length).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany with $eq", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $id}), (:User {id: $id}), (:User {id: $id})
    `;

    try {
      await session.run(createCypher, {
        id,
      });

      const found = await User.findMany({
        id: {
          $eq: id,
        },
      });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.include(id);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id STARTS WITH $id
        DELETE n
      `;

      await session.run(deleteCypher, {
        id,
      });

      const reFind = await User.findMany({
        id: {
          $eq: id,
        },
      });

      expect(reFind.length).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany with $gt and equality", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const number = 5;

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {number: $number, id: $id}), (:User {number: $number, id: $id}), (:User {number: $number, id: $id})
    `;

    try {
      await session.run(createCypher, {
        number,
        id,
      });

      const found = await User.findMany({
        id,
        number: {
          $gt: 2,
        },
      });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.equal(id);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id STARTS WITH $id
        DELETE n
      `;

      await session.run(deleteCypher, {
        id,
      });
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany with $gte and equality", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const number = 5;

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {number: $number, id: $id}), (:User {number: $number, id: $id}), (:User {number: $number, id: $id})
    `;

    try {
      await session.run(createCypher, {
        number,
        id,
      });

      const found = await User.findMany({
        id,
        number: {
          $gte: 5,
        },
      });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.equal(id);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id STARTS WITH $id
        DELETE n
      `;

      await session.run(deleteCypher, {
        id,
      });
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should findMany with $lt and equality", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const number = 5;

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {number: $number, id: $id}), (:User {number: $number, id: $id}), (:User {number: $number, id: $id})
    `;

    try {
      await session.run(createCypher, {
        number,
        id,
      });

      const found = await User.findMany({
        id,
        number: {
          $lt: 6,
        },
      });

      expect(found.length).to.equal(3);

      found.forEach((node) => {
        expect(node.id).to.equal(id);
      });

      const deleteCypher = `
        MATCH (n:User)
        WHERE n.id STARTS WITH $id
        DELETE n
      `;

      await session.run(deleteCypher, {
        id,
      });
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
