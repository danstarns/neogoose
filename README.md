# neogoose
Node.js Neo4j OGM inspired by [Mongoose](https://github.com/Automattic/mongoose) & [GraphQL](https://graphql.org/)

![Node.js CI](https://github.com/danstarns/neogoose/workflows/Node.js%20CI/badge.svg?branch=master&event=push) [![npm version](https://badge.fury.io/js/neogoose.svg)](https://www.npmjs.com/package/neogoose)

[![neogoose](https://github.com/danstarns/neogoose/blob/master/neogoose-banner.png?raw=true)](https://github.com/danstarns/neogoose)

# TLDR
Use [GraphQL schema language](https://graphql.org/learn/schema/#type-language) to define Models. On Model `CRUD` input validated & output resolved through a generated GraphQL schema. Modularize your [neo4js-graphql-js](https://grandstack.io/docs/neo4j-graphql-js-quickstart) augmented schema with the additional power of an OGM for further database operations.

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
const neogoose = require("neogoose");
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
> Models are defined using [GraphQL schema language](https://graphql.org/learn/schema/#type-language).

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

⚠ Models are not designed to support querying relationships **use a [session](#creating-a-session) for this**. This library is designed to place a `CRUD` api over nodes. You can also create an [Executable schema](#executable-schema) to execute more complex queries.

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
> Compile your models into an [neo4js-graphql-js](https://grandstack.io/docs/neo4j-graphql-js-quickstart) augmented schema
```js
const schema = neogoose.makeAugmentedSchema();
```

Transforms made before calling [makeAugmentedSchema](https://grandstack.io/docs/neo4j-graphql-js-quickstart)

1. `constraint` directives removed
2. `Validation` directives removed

⚠ All other schema directives [here](https://grandstack.io/docs/graphql-schema-directives) are ignored in `neogoose` land

### Query
Used with
1. `findOne`
2. `findMany`
3. `updateOne`
4. `updateMany`
5. `deleteOne`
6. `deleteMany`
7. `count`

#### Equality
```js
const dan = await User.findOne({
    name: "Dan",
});
```

#### $or 
```js
const users = await User.findMany({
    $or: [
        { name: "Dan" },
        { name: "Daniel" }
    ],
});
```

#### $and
```js
const users = await User.findMany({
    $and: [
        { name: "Dan" },
        { repo: "neogoose" }
    ],
});
```

#### $regex
```js
const users = await User.findMany({
    name: {
        $regex: '(?i)d.*' // equal to new Regex("^d", "i")
    },
});
```

⚠ Javascript regex not supported use regex stated [here](https://neo4j.com/docs/cypher-manual/current/clauses/where/#query-where-regex)

#### Comparison Operators
1. `$eq`
2. `$gt`
3. `$gte`
4. `$in`
5. `$lt`
6. `$lte`
7. `$ne`
8. `$nin`

#### Logical Operators
1. `$and`
2. `$nor` 
3. `$or` 

#### Evaluation Operators
1. `$regex`

### Skip/Limit
Used with
1. `findMany`
2. `updateMany`
3. `deleteMany`

```js
const paginatedUsers = await User.findMany(
    query,
    { skip: 30, limit: 10 }
);
```

### Creating
1. `create`
2. `createMany`

```js
const user = await User.create(
    {
        id: uuid(),
        name: "Dan",
        email: "email@email.com"
    },
    {
        return: true
    }
);

await User.createMany([ ... ])
```

### Find 
1. `findMany`
3. `findOne`

```js
const query = {
    name: "Dan",
};

const users = await User.findMany(query);

const dan = await User.findOne(query);
```

### Update 
1. `updateOne`
2. `updateMany`

```js
const query = {
    name: "Dan",
};

const update = {
    name: "naD"
};

await User.updateMany(query, update);

const user = await User.updateOne(
    query,
    update,
    { return: true } // use to return the updated node
);
```

#### Using $set
> Regular update will replace all properties use `$set` to `+=` properties on the node

```js
const query = {
    name: "Dan",
};

const update = {
    repo: "neogoose"
};

const user = await User.updateOne(
    query,
    { $set: update },
    { return: true }
);

user.name // Dan
user.repo // neogoose
```

#### Deleting properties
> $set to `null`

```js
const user = await User.updateOne(
    query,
    { $set: { loggedIn: null }
);
```

### Delete 
1. `deleteOne`
2. `deleteMany`

```js
const query = {
    name: "Dan",
};

await User.deleteOne(
    query, 
    {
        detach: true // set to true for DETACH DELETE, delete nodes and relationships
    }
);

const users = await User.deleteMany(
    query, 
    { return: true } // use to return the deleted nodes
);
```


### Count 
1. `count`

```js
const query = {
    name: "Dan",
};

const userCount = await User.count(
    query
);
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

### Selection Set

Used with
1. `findOne`
2. `findMany`
3. `updateOne`
4. `updateMany`
5. `deleteOne`
6. `deleteMany`

> Select more than [Autogenerated Selection Set](#autogenerated-selection-set) works well with [Resolvers](#resolvers) and complex nested types

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            type NestedType {
                abc: String
            }

            type User {
                id: ID!
                name: String!
                email: String!
                nested: NestedType!
            }
        `
    }
);

const selectionSet = `
    {
        id
        name
        email
        nested {
            abc
        }
    }
`

const dan = await User.findOne(
    {
        name: "Dan",
    },
    { selectionSet }
);
```

### Autogenerated Selection Set
⚠ If you don't specify [Selection Set](#selection-set) an auto generated one will be made based on the provided `type`.

```js
const User = neogoose.model(
    "User",
    {
        typeDefs: `
            type NestedType {
                abc: String
            }

            type User {
                id: ID!
                name: String!
                email: String!
                nested: NestedType!
            }
        `
    }
);

const AUTO_SELECTION_SET = `
    {
        id
        name
        email
        nested # ⚠ ERROR
    }
`
```

### Validation
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

### Auto Validation
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
