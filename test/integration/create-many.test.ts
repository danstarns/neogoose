import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("createMany", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("should create and return many", async () => {
    const id1 = generate({
      charset: "alphabetic",
    });
    const id2 = generate({
      charset: "alphabetic",
    });
    const id3 = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "READ" });

    try {
      const users = await User.createMany(
        [{ id: id1 }, { id: id2 }, { id: id3 }],
        { return: true }
      );

      users.forEach((u) => {
        expect(u.id).to.be.oneOf([id1, id2, id3]);
      });

      const query = `
        MATCH (n:User)
        WHERE n.id IN $ids
        RETURN n
      `;

      const res = await session.run(query, { ids: [id1, id2, id3] });

      res.records.forEach((r) => {
        expect(r.get("n").properties.id).to.be.oneOf([id1, id2, id3]);
      });
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
