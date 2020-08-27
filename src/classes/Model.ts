import {
  DocumentNode,
  ObjectTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
} from "graphql";
import { SessionOptions, Runtime } from "../types";
import { Connection } from "../classes";

interface Inputs {
  ON_CREATE: InputObjectTypeDefinitionNode;
  ON_MATCH: InputObjectTypeDefinitionNode;
}

export interface ModelInput {
  name: string;
  document: DocumentNode;
  sessionOptions?: SessionOptions;
  node: ObjectTypeDefinitionNode;
  inputs: Inputs;
  runtime: Runtime;
  connection?: Connection;
}

export default class Model<T = any> {
  public name: string;
  public document: DocumentNode;
  public sessionOptions?: SessionOptions;
  public node: ObjectTypeDefinitionNode;
  public inputs: Inputs;
  private runtime: Runtime;

  constructor(input: ModelInput) {
    this.name = input.name;
    this.document = input.document;
    this.sessionOptions = input.sessionOptions;
    this.node = input.node;
    this.inputs = input.inputs;
    this.runtime = input.runtime;
  }

  createOne(): void {
    // TODO
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
