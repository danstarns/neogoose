import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("findOne", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("should find one by id", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (n:User {id: $id})
    `;

    try {
      await session.run(createCypher, { id });

      const found = await User.findOne({ id });

      expect(found.id).to.equal(id);

      const deleteCypher = `
        MATCH (n:User {id: $id})
        DELETE n
      `;

      await session.run(deleteCypher, { id });

      const reFind = await User.findOne({ id });

      expect(reFind).to.equal(undefined);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
