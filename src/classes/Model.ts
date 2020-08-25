import { DocumentNode } from "graphql";
import { SessionOptions } from "../types";

interface ModelInput {
  name: string;
  document: DocumentNode;
  sessionOptions?: SessionOptions;
}

class Model<T = any> {
  public name: string;
  private document: DocumentNode;
  private sessionOptions?: SessionOptions;

  constructor(input: ModelInput) {
    this.name = input.name;
    this.document = input.document;
    this.sessionOptions = input.sessionOptions;
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

export = Model;
