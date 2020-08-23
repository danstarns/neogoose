import { DocumentNode } from "graphql";
import { SessionOptions } from "../types";

interface ModelInput {
  name: string;
  document: DocumentNode;
  sessionOptions?: SessionOptions;
}

class Model {
  public name: string;
  private document: DocumentNode;
  private sessionOptions?: SessionOptions;

  constructor(input: ModelInput) {
    this.name = input.name;
    this.document = input.document;
    this.sessionOptions = input.sessionOptions;
  }
}

export = Model;
