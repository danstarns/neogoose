import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("updateMany", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("should update many by id", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const name = "Dan";

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $id, name: $name}), (:User {id: $id, name: $name}), (:User {id: $id, name: $name})
    `;

    try {
      await session.run(createCypher, { id, name });

      const updated = await User.updateMany({ id }, { id }, { return: true });

      updated.forEach((update) => {
        expect(update.id).to.equal(id);
        expect(update.name).to.equal(null);
      });

      const deleteCypher = `
        MATCH (n:User {id: $id})
        DELETE n
      `;

      await session.run(deleteCypher, { id });
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });

  it("should use $set and update many name (keeping id)", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const name = "Dan";

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $id, name: $name}), (:User {id: $id, name: $name}), (:User {id: $id, name: $name})
    `;

    try {
      await session.run(createCypher, { id, name });

      const updated = await User.updateMany(
        { id },
        { $set: { name: "Daniel" } },
        { return: true }
      );

      updated.forEach((update) => {
        expect(update.id).to.equal(id);
        expect(update.name).to.equal("Daniel");
      });

      const deleteCypher = `
        MATCH (n:User {id: $id})
        DELETE n
      `;

      await session.run(deleteCypher, { id });
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
