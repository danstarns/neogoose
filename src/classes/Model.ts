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
  CreateOptions,
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

  private async outputOne({
    selection,
    result,
  }: {
    selection: string;
    result: any;
  }): Promise<T | any> {
    const resolved = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query {
          ${this.name}OutputOne${selection}
        }
      `,
      contextValue: {
        input: result,
      },
    });

    if (resolved.errors) {
      throw new Error(resolved.errors[0].message);
    }

    const node = resolved.data[`${this.name}OutputOne`];

    if (node) {
      // Trick to remove '[Object: null prototype]'
      return JSON.parse(JSON.stringify(node));
    }
  }

  private async outputMany({
    selection,
    result,
  }: {
    selection: string;
    result: any;
  }): Promise<T[]> {
    const resolved = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query {
          ${this.name}OutputMany${selection}
        }
      `,
      contextValue: {
        input: result,
      },
    });

    if (resolved.errors) {
      throw new Error(resolved.errors[0].message);
    }

    const nodes = resolved.data[`${this.name}OutputMany`];

    // Trick to remove '[Object: null prototype]'
    return JSON.parse(JSON.stringify(nodes));
  }

  private async inputOne({ params }: { params: any }) {
    const resolved = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($input: ${this.name}_Input) {
          ${this.name}InputOne(input: $input)
        }
      `,
      variableValues: {
        input: params,
      },
    });

    if (resolved.errors) {
      throw new Error(resolved.errors[0].message);
    }
  }

  private async inputMany({ params }: { params: any }) {
    const resolved = await graphql({
      schema: this.runtime.validationSchema,
      source: `
        query ($input: [${this.name}_Input]) {
          ${this.name}InputMany(input: $input)
        }
      `,
      variableValues: {
        input: params,
      },
    });

    if (resolved.errors) {
      throw new Error(resolved.errors[0].message);
    }
  }

  @Connected
  async createOne(params: any, options: CreateOptions = {}): Promise<T> {
    await this.inputOne({ params });

    const result = await neo4j.createOne({ model: this, options, params });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolved = await this.outputOne({ selection, result });

      return resolved;
    }
  }

  @Connected
  async createMany(params: any[], options: CreateOptions = {}): Promise<T[]> {
    await this.inputMany({ params });

    const result = await neo4j.createMany({ model: this, options, params });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolved = await this.outputMany({ selection, result });

      return resolved;
    }
  }

  @Connected
  async findOne(query: Query = {}, options: FindOneOptions = {}): Promise<T> {
    const result = await neo4j.findOne<T>({ model: this, query });

    const selection = options.selectionSet
      ? options.selectionSet
      : this.selectionSet;

    const resolved = await this.outputOne({ selection, result });

    return resolved;
  }

  @Connected
  async findMany(
    query: Query = {},
    options: FindManyOptions = {}
  ): Promise<T[]> {
    const result = await neo4j.findMany<T>({ model: this, query, options });

    const selection = options.selectionSet
      ? options.selectionSet
      : this.selectionSet;

    const resolved = await this.outputMany({
      selection,
      result,
    });

    return resolved;
  }

  @Connected
  async updateOne(
    query: Query = {},
    update: Update = {},
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
           $update: ${this.name}_Input
        ) {
            ${this.name}Update(input: $update)
          }
      `,
      variableValues: {
        update: normal,
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.updateOne<T>({
      model: this,
      query,
      update: normal,
      set: set,
      options,
    });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolved = await this.outputOne({ selection, result });

      return resolved;
    }
  }

  @Connected
  async updateMany(
    query: Query = {},
    update: Update = {},
    options: UpdateManyOptions = {}
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
           $update: ${this.name}_Input
        ) {
            ${this.name}Update(input: $update)
          }
      `,
      variableValues: {
        update: normal,
      },
    });

    if (validate.errors) {
      throw new Error(validate.errors[0].message);
    }

    const result = await neo4j.updateMany<T>({
      model: this,
      query,
      update: normal,
      set: set,
      options,
    });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolved = await this.outputMany({ selection, result });

      return resolved;
    }
  }

  @Connected
  async deleteOne(
    query: Query = {},
    options: DeleteOneOptions = {}
  ): Promise<T | void> {
    const result = await neo4j.deleteOne<T>({ model: this, query, options });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolved = await this.outputOne({ selection, result });

      return resolved;
    }
  }

  @Connected
  async deleteMany(
    query: Query = {},
    options: DeleteManyOptions = {}
  ): Promise<T[]> {
    const result = await neo4j.deleteMany<T>({ model: this, query, options });

    if (options.return) {
      const selection = options.selectionSet
        ? options.selectionSet
        : this.selectionSet;

      const resolved = await this.outputMany({ selection, result });

      return resolved;
    }
  }
}
