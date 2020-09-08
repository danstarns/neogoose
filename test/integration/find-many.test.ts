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
        CREATE (:User {id: $id}), (:User {id: $id}), (:User {id: $id}), (:User {id: "random user"})
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
});
