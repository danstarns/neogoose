import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("deleteMany", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("delete many by id", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (:User {id: $id}), (:User {id: $id}), (:User {id: $id})
    `;

    try {
      await session.run(createCypher, { id });

      await User.deleteMany({ id });

      const query = `
        MATCH (n:User {id: $id})
        RETURN n
      `;

      const res = await session.run(query, { id });

      expect(res.records.length).to.equal(0);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
