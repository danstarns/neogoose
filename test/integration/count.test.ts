import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("count", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("should count by id", async () => {
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

      const count = await User.count({ id: id });

      expect(count).to.equal(3);

      const deleteCypher = `
        MATCH (n:User {id: $id})
        DELETE n
      `;

      await session.run(deleteCypher, { id });

      const reCount = await User.count({ id });

      expect(reCount).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
