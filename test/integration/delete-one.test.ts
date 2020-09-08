import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("deleteOne", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("delete find one by id", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "WRITE" });

    const createCypher = `
        CREATE (n:User {id: $id})
    `;

    try {
      await session.run(createCypher, { id });

      await User.deleteOne({ id });

      const query = `
        MATCH (n:User {id: $id})
        RETURN n
      `;

      const res = await session.run(query, { id });

      const node = res.records[0];

      expect(Boolean(node)).to.equal(false);
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
