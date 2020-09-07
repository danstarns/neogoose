import {
  DocumentNode,
  ObjectTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  graphql,
  FieldDefinitionNode,
} from "graphql";
import {
  SessionOptions,
  Runtime,
  Resolvers,
  CreateOneInput,
  ModelInput,
  FindOneInput,
  FindOneOptions,
  FindManyInput,
  FindManyOptions,
  DeleteOneInput,
  DeleteOneOptions,
  DeleteManyInput,
  DeleteManyOptions,
} from "../types";
import * as neo4j from "../neo4j";

function Connected(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const model: Model = this;

    if (!model.runtime.connection) {
      throw new Error("Not connected");
    }

    return originalMethod.apply(this, args);
  };
}

export default class Model<T = any> {
  public name: string;
  public document: DocumentNode;
  public sessionOptions?: SessionOptions;
  public node: ObjectTypeDefinitionNode;
  public fields: FieldDefinitionNode[];
  public relations: FieldDefinitionNode[];
  public cyphers: FieldDefinitionNode[];
  public nested: FieldDefinitionNode[];
  public properties?: InputObjectTypeDefinitionNode;
  public resolvers?: Resolvers;
  public selectionSet?: string;
  public runtime: Runtime;

  constructor(input: ModelInput) {
    this.name = input.name;
    this.document = input.document;
    this.sessionOptions = input.sessionOptions;
    this.node = input.node;
    this.properties = input.properties;
    this.runtime = input.runtime;
    this.resolvers = input.resolvers;
    this.relations = input.relations;
    this.cyphers = input.cyphers;
    this.fields = input.fields;
    this.nested = input.nested;
    this.selectionSet = input.selectionSet;
  }

  // TODO not working
  @Connected
  async createOne(input: CreateOneInput): Promise<void> {
    const { errors } = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        mutation ($CreateOneInput: User_Input!) {
          ${this.name}CreateOneInput(input: $CreateOneInput)
        }
      `,
      variableValues: {
        CreateOneInput: input,
      },
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    await neo4j.createOne({ model: this, input });
  }

  @Connected
  createMany(): void {
    // TODO
  }

  @Connected
  async findOne(
    input: FindOneInput = {},
    options: FindOneOptions = {}
  ): Promise<T> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($FindOneInput: User_Find_Input!) {
          ${this.name}FindOneInput(input: $FindOneInput)
        }
      `,
      variableValues: {
        FindOneInput: input,
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.findOne<T>({ model: this, input });

    const selection = options.selectionSet
      ? options.selectionSet
      : this.selectionSet;

    const resolve = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query {
          ${this.name}FindOneOutput${selection}
        }
      `,
      contextValue: {
        input: result,
      },
    });

    if (resolve.errors) {
      throw new Error(resolve.errors[0].message);
    }

    const node = resolve.data[`${this.name}FindOneOutput`];

    if (node) {
      // Trick to remove '[Object: null prototype]'
      return JSON.parse(
        JSON.stringify(resolve.data[`${this.name}FindOneOutput`])
      );
    }
  }

  @Connected
  async findMany(
    input: FindManyInput = {},
    options: FindManyOptions = {}
  ): Promise<T[]> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($FindManyInput: User_Find_Input!) {
          ${this.name}FindManyInput(input: $FindManyInput)
        }
      `,
      variableValues: {
        FindManyInput: input,
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.findMany<T>({ model: this, input, options });

    const selection = options.selectionSet
      ? options.selectionSet
      : this.selectionSet;

    const resolve = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query {
          ${this.name}FindManyOutput${selection}
        }
      `,
      contextValue: {
        input: result,
      },
    });

    if (resolve.errors) {
      throw new Error(resolve.errors[0].message);
    }

    const nodes = resolve.data[`${this.name}FindManyOutput`];

    // Trick to remove '[Object: null prototype]'
    return JSON.parse(JSON.stringify(nodes));
  }

  @Connected
  updateOne(): void {
    // TODO
  }

  @Connected
  updateMany(): void {
    // TODO
  }

  @Connected
  async deleteOne(
    input: DeleteOneInput = {},
    options: DeleteOneOptions = {}
  ): Promise<T | void> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        mutation ($DeleteOneInput: User_Find_Input!) {
          ${this.name}DeleteOneInput(input: $DeleteOneInput)
        }
      `,
      variableValues: {
        DeleteOneInput: input,
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.deleteOne<T>({ model: this, input, options });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolve = await graphql({
        schema: this.runtime.validationSchema,
        source: `
          mutation {
            ${this.name}DeleteOneOutput${selection}
          }
        `,
        contextValue: {
          input: result,
        },
      });

      if (resolve.errors) {
        throw new Error(resolve.errors[0].message);
      }

      const node = resolve.data[`${this.name}DeleteOneOutput`];

      if (node) {
        // Trick to remove '[Object: null prototype]'
        return JSON.parse(JSON.stringify(node));
      }
    }
  }

  @Connected
  async deleteMany(
    input: DeleteManyInput = {},
    options: DeleteManyOptions = {}
  ): Promise<T | void> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        mutation ($DeleteManyInput: User_Find_Input!) {
          ${this.name}DeleteManyInput(input: $DeleteManyInput)
        }
      `,
      variableValues: {
        DeleteManyInput: input,
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.deleteMany<T>({ model: this, input, options });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolve = await graphql({
        schema: this.runtime.validationSchema,
        source: `
          mutation {
            ${this.name}DeleteManyOutput${selection}
          }
        `,
        contextValue: {
          input: result,
        },
      });

      if (resolve.errors) {
        throw new Error(resolve.errors[0].message);
      }

      const nodes = resolve.data[`${this.name}DeleteManyOutput`];

      // Trick to remove '[Object: null prototype]'
      return JSON.parse(JSON.stringify(nodes));
    }
  }
}
