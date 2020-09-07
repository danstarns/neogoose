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
} from "../types";
import * as neo4j from "../neo4j";

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

  createMany(): void {
    // TODO
  }

  async findOne(input: FindOneInput, options: FindOneOptions = {}): Promise<T> {
    if (!input) {
      throw new Error("input required");
    }

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

    // Trick to remove '[Object: null prototype]'
    return JSON.parse(
      JSON.stringify(resolve.data[`${this.name}FindOneOutput`])
    );
  }

  findMany(): void {
    // TODO
  }

  updateOne(): void {
    // TODO
  }

  updateMany(): void {
    // TODO
  }

  deleteOne(): void {
    // TODO
  }

  deleteMany(): void {
    // TODO
  }
}
