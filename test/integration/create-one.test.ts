import { User } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";

describe("createOne", () => {
  let driver: Driver;

  before((done) => {
    neo4j().then((d) => {
      driver = d;

      done();
    });
  });

  it("should create and return one", async () => {
    const id = generate({
      charset: "alphabetic",
    });

    const session = driver.session({ defaultAccessMode: "READ" });

    try {
      const user = await User.createOne({ id }, { return: true });

      expect(user.id).to.equal(id);

      const query = `
        MATCH (n:User {id: $id})
        RETURN n
      `;

      const res = await session.run(query, { id });

      expect(res.records[0].get("n").properties).to.deep.equal({ id });
    } catch (error) {
      throw error;
    } finally {
      session.close();
    }
  });
});
