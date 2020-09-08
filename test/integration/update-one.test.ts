import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("updateOne", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("should update one by id", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const name = "Dan";

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (n:User {id: $id, name: $name})
    `;

    try {
      await session.run(createCypher, { id, name });

      const updated = await User.updateOne({ id }, { id }, { return: true });

      expect(updated.id).to.equal(id);
      expect(updated.name).to.equal(null);

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

  it("should use $set and update name (keeping id)", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const name = "Dan";

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
          CREATE (n:User {id: $id, name: $name})
      `;

    try {
      await session.run(createCypher, { id, name });

      const updated = await User.updateOne(
        { id },
        { $set: { name: "Daniel" } },
        { return: true }
      );

      expect(updated.id).to.equal(id);
      expect(updated.name).to.equal("Daniel");

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
