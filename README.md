# neogoose
Node.js Neo4j OGM inspired by [Mongoose](https://github.com/Automattic/mongoose) & [GraphQL](https://graphql.org/)

# Installation
First install [Node.js](https://nodejs.org/en/) and [Neo4j](https://neo4j.com/). Then:

```
$ npm install neogoose
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

### Defining a Model
> Models are defined using [GraphQL schema language](https://graphql.org/learn/schema/#type-language)

```js
const User = neogoose.model(
    `
        type User {
            id: ID!
            name: String!
            email: String!
        }
    `
);
```

### Creating Nodes
```js
const user = await User.create({
    id: uuid(),
    name: "Dan",
    email: "email@email.com"
});
```

### Validate Input
> Built in support for [graphql-constraint-directive](https://github.com/confuser/graphql-constraint-directive)

```js
const User = neogoose.model(
    `
        type User {
            id: ID!
            name: String!
            email: String! @constraint(minLength: 5, format: "email")
        }
    `
);
```

### Find Nodes 
1. `find`
2. `findById`
3. `findOne`

```js
const users = await User.find({
    name: "Dan",
});

const user = await User.findById(1); // Internal ID

const dan = await User.findOne({
    name: "Dan",
});
```

### Creating Relationships
> Usage of in-built `@relationship()` directive

```js
const User = neogoose.model(
    `
        type UserPostCreatedProperties {
            date: String!
        }


        type User {
            posts: [Post] @relation(label: "CREATED", properties: UserPostCreatedProperties!)
        }
    `
);

const Post = neogoose.model(
    `
        type Post {
            title: String!
        }
    `
);

const user = await User.create({
    posts: [
     { 
        relation: { 
            date: new Date()
        }, 
        node: { 
            title: "COOL 🍻"
        } 
     }
    ]
});
```