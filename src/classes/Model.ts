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
  FindOneOptions,
  FindManyOptions,
  DeleteOneOptions,
  DeleteManyOptions,
  Update,
  UpdateOneOptions,
  Query,
  UpdateManyOptions,
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
        query ($CreateOneInput: ${this.name}_Input!) {
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
  async findOne(input: Query = {}, options: FindOneOptions = {}): Promise<T> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($FindOneInput: ${this.name}_Find_Input!) {
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
      return JSON.parse(JSON.stringify(node));
    }
  }

  @Connected
  async findMany(
    input: Query = {},
    options: FindManyOptions = {}
  ): Promise<T[]> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($FindManyInput: ${this.name}_Find_Input!) {
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
  async updateOne(
    input: Query,
    update: Update,
    options: UpdateOneOptions = {}
  ): Promise<T | any> {
    const fieldNames = this.fields.map((x) => x.name.value);

    const { set, normal } = Object.entries(update).reduce(
      (res, [k, v]) => {
        if (k === "$set") {
          if (!res.set) {
            res.set = {};
          }

          res.set = Object.entries(v).reduce((r, [x, y]) => {
            if (!fieldNames.includes(x)) {
              return r;
            }

            return { ...r, [x]: y };
          }, {});
        } else {
          if (!res.normal) {
            res.normal = {};
          }

          res.normal[k] = v;
        }

        return res;
      },
      {
        set: null,
        normal: null,
      }
    );

    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query (
           ${normal ? `$UpdateInput: ${this.name}_Update_Input,` : ""}
           $FindOneInput: ${this.name}_Find_Input
        ) {
            ${this.name}FindOneInput(input: $FindOneInput)
            ${normal ? `${this.name}UpdateInput(input: $UpdateInput)` : ""}
          }
      `,
      variableValues: {
        FindOneInput: input,
        ...(normal ? { UpdateInput: normal } : {}),
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.updateOne<T>({
      model: this,
      query: input,
      update: normal,
      set: set,
      options,
    });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolve = await graphql({
        schema: this.runtime.validationSchema,
        source: `
          query {
            ${this.name}UpdateOneOutput${selection}
          }
        `,
        contextValue: {
          input: result,
        },
      });

      if (resolve.errors) {
        throw new Error(resolve.errors[0].message);
      }

      const node = resolve.data[`${this.name}UpdateOneOutput`];

      if (node) {
        // Trick to remove '[Object: null prototype]'
        return JSON.parse(JSON.stringify(node));
      }
    }
  }

  @Connected
  async updateMany(
    input: Query,
    update: Update,
    options: UpdateManyOptions
  ): Promise<T[]> {
    const fieldNames = this.fields.map((x) => x.name.value);

    const { set, normal } = Object.entries(update).reduce(
      (res, [k, v]) => {
        if (k === "$set") {
          if (!res.set) {
            res.set = {};
          }

          res.set = Object.entries(v).reduce((r, [x, y]) => {
            if (!fieldNames.includes(x)) {
              return r;
            }

            return { ...r, [x]: y };
          }, {});
        } else {
          if (!res.normal) {
            res.normal = {};
          }

          res.normal[k] = v;
        }

        return res;
      },
      {
        set: null,
        normal: null,
      }
    );

    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query (
           ${normal ? `$UpdateInput: ${this.name}_Update_Input,` : ""}
           $UpdateManyInput: ${this.name}_Find_Input
        ) {
           ${this.name}FindOneInput(input: $UpdateManyInput)
           ${normal ? `${this.name}UpdateInput(input: $UpdateInput)` : ""}
          }
      `,
      variableValues: {
        UpdateManyInput: input,
        ...(normal ? { UpdateInput: normal } : {}),
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.updateMany<T>({
      model: this,
      query: input,
      update: normal,
      set: set,
      options,
    });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolve = await graphql({
        schema: this.runtime.validationSchema,
        source: `
          query {
            ${this.name}UpdateManyOutput${selection}
          }
        `,
        contextValue: {
          input: result,
        },
      });

      if (resolve.errors) {
        throw new Error(resolve.errors[0].message);
      }

      const nodes = resolve.data[`${this.name}UpdateManyOutput`];

      // Trick to remove '[Object: null prototype]'
      return JSON.parse(JSON.stringify(nodes));
    }
  }

  @Connected
  async deleteOne(
    input: Query = {},
    options: DeleteOneOptions = {}
  ): Promise<T | void> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($DeleteOneInput: User_Find_Input!) {
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
          query {
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
    input: Query = {},
    options: DeleteManyOptions = {}
  ): Promise<T | void> {
    const validate = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($DeleteManyInput: User_Find_Input!) {
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
          query {
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
