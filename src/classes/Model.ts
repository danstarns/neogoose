import {
  DocumentNode,
  ObjectTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  graphql,
} from "graphql";
import { SessionOptions, Runtime, Resolvers } from "../types";
import { Connection } from "../classes";

export interface ModelInput {
  name: string;
  document: DocumentNode;
  sessionOptions?: SessionOptions;
  node: ObjectTypeDefinitionNode;
  properties?: InputObjectTypeDefinitionNode;
  runtime: Runtime;
  connection?: Connection;
  resolvers?: Resolvers;
}

interface CreateOneInput {
  [k: string]:
    | any
    | any[]
    | { properties: { [kk: string]: any }; node: CreateOneInput }
    | { properties: { [kk: string]: any }; node: CreateOneInput }[];
}

export default class Model<T = any> {
  public name: string;
  public document: DocumentNode;
  public sessionOptions?: SessionOptions;
  public node: ObjectTypeDefinitionNode;
  public properties?: InputObjectTypeDefinitionNode;
  public resolvers?: Resolvers;
  public selectionSet?: string;
  private runtime: Runtime;

  constructor(input: ModelInput) {
    this.name = input.name;
    this.document = input.document;
    this.sessionOptions = input.sessionOptions;
    this.node = input.node;
    this.properties = input.properties;
    this.runtime = input.runtime;
    this.resolvers = input.resolvers;
  }

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
  }

  createMany(): void {
    // TODO
  }

  findOne(): void {
    // TODO
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
