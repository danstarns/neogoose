import { User, Post } from "./models";
import neo4j from "./neo4j";
import { Driver } from "neo4j-driver";
import { generate } from "randomstring";
import { expect } from "chai";
import { v4 as uuid } from "uuid";

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

  it("should throw constraint error when creating node with bad ID", async () => {
    try {
      await Post.createOne(
        {
          id: "Invalid",
          title: "s",
        },
        { return: true }
      );

      throw new Error("I should not throw");
    } catch (error) {
      expect(error.message).to.contain("Must be in UUID format");
    }
  });

  it("should throw constraint error when creating node with bad name", async () => {
    const id = uuid();

    try {
      await Post.createOne(
        {
          id,
          title: "s",
        },
        { return: true }
      );

      throw new Error("I should not throw");
    } catch (error) {
      expect(error.message).to.contain(
        "Must be at least 5 characters in length"
      );
    }
  });
});
