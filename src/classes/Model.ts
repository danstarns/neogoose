import {
  DocumentNode,
  ObjectTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
} from "graphql";
import { SessionOptions } from "../types";

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
}

export default class Model<T = any> {
  public name: string;
  public document: DocumentNode;
  public sessionOptions?: SessionOptions;
  public node: ObjectTypeDefinitionNode;
  public inputs: Inputs;

  constructor(input: ModelInput) {
    this.name = input.name;
    this.document = input.document;
    this.sessionOptions = input.sessionOptions;
    this.node = input.node;
    this.inputs = input.inputs;
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
