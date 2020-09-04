# neogoose
![Node.js CI](https://github.com/danstarns/neogoose/workflows/Node.js%20CI/badge.svg?branch=master&event=push) [![npm version](https://badge.fury.io/js/neogoose.svg)](https://www.npmjs.com/package/neogoose) [![TypeScript Compatible](https://img.shields.io/npm/types/scrub-js.svg)](https://github.com/danstarns/neogoose)

Node.js Neo4j OGM inspired by [Mongoose](https://github.com/Automattic/mongoose) & [GraphQL](https://graphql.org/)

⚠ Work in progress

# TLDR
Use [GraphQL schema language](https://graphql.org/learn/schema/#type-language) to define `Models`. On `Model` `CRUD` input is validated & output resolved through a generated GraphQL schema. Modularize your [neo4js-graphql-js](https://grandstack.io/docs/neo4j-graphql-js-quickstart) augmented schema with the additional power of an OGM for further database operations.

# Installation
First install [Node.js](https://nodejs.org/en/), then start [Neo4j](https://neo4j.com/) & finally...

```
$ npm install neogoose
```

⚠ `neo4j-driver` and `graphql` are **peerDependencies** you may need to install them too. 

```
$ npm install neo4j-driver graphql
```

## Importing
```js
// Using require
const neogoose = require("neogoose");

// Using import
import neogoose from "neogoose";
```

# Prior Art
1. [neode](https://github.com/adam-cowley/neode)
2. [mongoose](https://github.com/Automattic/mongoose)
3. [neo4j-graphql-js](https://github.com/neo4j-graphql/neo4j-graphql-js)
4. [graphql](https://graphql.org/)

# Overview
### Connecting to Neo4j
```js
await neogoose.connect("neo4j://localhost");
```

> Creating Multiple connections

```js
const connection1 = await neogoose.createConnection("neo4j://1.1.1.1");
const connection2 = await neogoose.createConnection("neo4j://2.2.2.2");
```

### Disconnecting
```js
await neogoose.disconnect();
```

### Defining a Model
> Models are defined using [GraphQL schema language](https://graphql.org/learn/schema/#type-language)

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            type User {
                id: ID!
                name: String!
                email: String!
            }
        `
    }
);
```

⚠ Models are not designed to support querying relationships **use a [session](#creating-a-session) for this**. This library is designed to place a `CRUD` api over nodes, with the exemption of [creating relationships](#creating-relationships). You also create an [Executable schema](#executable-schema) to execute more complex queries.

### Creating a session
```js
await neogoose.connect("neo4j://localhost");

// https://neo4j.com/developer/javascript/
const session = await neogoose.session();
```

### Retrieving a model
```js
const user = neogoose.model("User");
```

### Executable schema
> Compile your models into an [neo4js-graphql-js](https://grandstack.io/docs/neo4j-graphql-js-quickstart) augmented schema.
```js
const schema = neogoose.makeAugmentedSchema();
```

### Creating
1. `create`
2. `createMany`

```js
const user = await User.create({
    id: uuid(),
    name: "Dan",
    email: "email@email.com"
});

const users = await User.createMany([ ... ])
```

### Find 
1. `findMany`
3. `findOne`

```js
const users = await User.findMany({
    name: "Dan",
});

const dan = await User.findOne({
    name: "Dan",
});
```

### Update 
1. `updateOne`
2. `updateMany`

```js
const users = await User.updateOne(
    {
        name: "Dan",
    },
    {
        name: "naD"
    }
);

const users = await User.updateMany([ ... ]);
```

### Delete 
1. `deleteOne`
2. `deleteMany`

```js
const users = await User.deleteOne(
    {
        name: "Dan",
    }
);

const users = await User.deleteMany([ ... ]);
```

### Merge 
1. `mergeOne`
2. `mergeMany`

```js
const users = await User.mergeOne(
    {
        name: "Dan",
    }
);

const users = await User.mergeMany([ ... ]);
```

### Resolvers
```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            type User {
                id: ID!
                name: String!
                email: String!
                resolved: String!
            }
        `,
        resolvers: {
            User: {
                id: (root) => root.id, // Not needed
                resolved: () => "I was Resolved"
            }
        }
    }
);
```

### Node Properties
> Built in support for `@Validation` directive.

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            input UserProperties {
                id: ID! 
                name: String
                email: String
            }

            type User @Validation(properties: UserProperties) {
                id: ID!
                name: String!
                email: String!
            }
        `
    }
);
```

### Auto Input
⚠ If you don't specify `@Validation` an auto generated `input` will be made based on the provided `type`. **Nested `input` types are not supported!**

**Before**
```js
{
    typeDefs: `
        type User  {
            id: ID!
            name: String!
            email: String!
        }
    `
}
```

**After**
> The below is representing the Models auto generated schema if you don't provide `@Validation` directive.

```js
{
    typeDefs: `
        input AUTO_GENERATED { # Default if you don't specify properties
            id: ID!
            name: String!
            email: String!  
        }

        type User @Validation(properties: AUTO_GENERATED) {
            id: ID!
            name: String!
            email: String!
        }
    `
}
```

### Directives
> Built in support for [graphql-constraint-directive](https://github.com/confuser/graphql-constraint-directive).

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            input UserProperties {
                id: ID! @constraint(minLength: 5, format: "uid")
                name: String @constraint(minLength: 5)
                email: String @constraint(minLength: 5, format: "email")
            }

            type User @Validation(properties: UserProperties) {
                id: ID!
                name: String!
                email: String!
            }
        `
    }
);
```
⚠ `@constraint` directives are removed before augmented schema generation.

### Creating Relationships
> Usage of in-built `@Relationship` directive

```js
const Comment = neogoose.model("Comment", {
    typeDefs: `
      type Comment {
        content: String!
      }
    `,
});

const Post = neogoose.model("Post", {
    typeDefs: `
        input PostInput {
          title: String!
        }   

        type Post @Validation(properties: PostInput){
          title: String!
          comments: [Comment] @Relationship(
              direction: "OUT",
              label: "COMMENTED"
          )
        }
    `,
});

const User = neogoose.model("User", {
    typeDefs: `
        input UserInput {
            name: String!
        }

        type User @Validation(properties: UserInput){
            name: String!
            posts: [Post] @Relationship(
                direction: "OUT",
                label: "POSTED"
            )
        }
    `,
});

await User.createOne({
    name: "daniel",
    posts: [
      {
        node: {
          title: "title",
          comments: [
            {
                node: {
                    content: "Cool Post",
                },
            }
          ],
        },
      },
    ],
});

/*
Generated Cypher query 

CREATE (this:User {name: "daniel"}), (uuidone:Post {title: "title"}), (uuidtwo:Comment {name: "Cool Post"})
MERGE (this)-[:POSTED]->(uuidone)
MERGE (uuidone)-[:COMMENTED]->(uuidtwo)

*/
```

### Relationship Properties
> Use `properties`, the rules for [Auto Input](#auto-input) applies. 

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            input UserPostProperties {
                date: String!
            }

            input UserInput { # ⚠ don't specify 'posts' field here.
                name: String!
            }

            type User @Validation(properties: UserInput) {
                name: String!
                posts: [Post]! @Relationship(
                    properties: UserPostProperties,
                    direction: "OUT",
                    label: "POSTED"
                )
            }
        `
    }
);

const user = await User.create({
    posts: [
     { 
        properties: {
            date: new Date().toISOString()
        }, 
        node: { 
            title: "COOL 🍻"
        }
     }
    ]
});
```

⚠ Notice you would not specify `posts` as a `Field` on `input` `UserInput`