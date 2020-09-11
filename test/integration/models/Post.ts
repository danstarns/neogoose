import { default as neogoose } from "../../../src";

const Post = neogoose.model("Post", {
  typeDefs: `
        input PostInput {
            id: String! @constraint(format: "uuid")
            title: String! @constraint(minLength: 5)
        }
        
        type Post @Validation(properties: PostInput){
            id: String!
            title: String!
        }
    `,
});

export = Post;
