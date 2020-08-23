# neogoose
![Node.js CI](https://github.com/danstarns/neogoose/workflows/Node.js%20CI/badge.svg?branch=master&event=push) [![npm version](https://badge.fury.io/js/neogoose.svg)](https://www.npmjs.com/package/neogoose) [![TypeScript Compatible](https://img.shields.io/npm/types/scrub-js.svg)](https://github.com/danstarns/neogoose)

Node.js Neo4j OGM inspired by [Mongoose](https://github.com/Automattic/mongoose) & [GraphQL](https://graphql.org/)

# Installation
First install [Node.js](https://nodejs.org/en/) and [Neo4j](https://neo4j.com/). Then:

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

⚠ Models are not designed to support querying relationships **use a [session](#creating-a-session) for this**. This library is designed to place a `CRUD` api over nodes, with the exemption of [creating relationships](#creating-relationships).

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

### Creating Nodes
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

### Find Nodes 
1. `find`
3. `findOne`

```js
const users = await User.find({
    name: "Dan",
});

const dan = await User.findOne({
    name: "Dan",
});
```

### Update Nodes 
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

### Delete Nodes 
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


### Validate Input
> Built in support for [graphql-constraint-directive](https://github.com/confuser/graphql-constraint-directive) & homemade `@Validation` directive.

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            input UserCreate {
                id: ID! @constraint(minLength: 5, format: "uid")
                name: String! @constraint(minLength: 5)
                email: String! @constraint(minLength: 5, format: "email")
            }

            input UserUpdate {
                name: String! @constraint(minLength: 5)
                email: String! @constraint(minLength: 5, format: "email")
            }


            type User @Validation(ON_CREATE: UserCreate, ON_MATCH: UserUpdate) {
                id: ID!
                name: String!
                email: String!
            }
        `
    }
);
```

#### Auto Input
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
        input AUTO_GENERATED { # Default if you don't specify ON_CREATE or ON_MATCH
            id: ID!
            name: String!
            email: String!  
        }

        type User @Validation(ON_CREATE: AUTO_GENERATED, ON_MATCH: AUTO_GENERATED) {
            id: ID!
            name: String!
            email: String!
        }
    `
}
```
### Creating Relationships
> Usage of in-built `@Relationship()` directive

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            type UserPostCreatedProperties {
                date: String!
            }


            type User {
                posts: [Post] @Relationship(properties: UserPostCreatedProperties) # -> OUT direction
            }
        `
    }
);

const Post = neogoose.model(
    "Post", 
    {
        typeDefs: `
            type Post {
                title: String!
            }
        `
    }
);

const user = await User.create({
    posts: [
     { 
        relation: { 
            properties: {
                date: new Date().toISOString()
            },
            labels: ["CREATED"]
        }, 
        node: { 
            title: "COOL 🍻"
        }
     }
    ]
});
```

#### Validate Relationships
> Use `ON_CREATE` and `ON_MATCH`, the rules for [Auto Input](#auto-input) applies. 

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            type UserPostRelation {
                date: String!
            }

            input UserPostRelationInput {
                date: String!
            }

            input UserInput { # don't specify posts validation here
                name: String!
            }

            type User @Validation(ON_CREATE: UserInput, ON_MATCH: UserInput) {
                name: String!
                posts: [Post] @Relationship(
                    properties: UserPostRelation,
                    ON_CREATE: UserPostRelationInput,
                    ON_MATCH: UserPostRelationInput
                ) # -> OUT direction
            }
        `
    }
);
```

 ⚠ Notice you would not specify `posts` as a `Field` on `input` `UserInput`