import { default as neogoose } from "../../../src";

const User = neogoose.model("User", {
  typeDefs: `
        type User {
            id: ID
            name: String
            age: Int
        }
    `,
});

export = User;
