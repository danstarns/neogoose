import { DocumentNode } from "graphql";

class Model {
  public name: string;
  private document: DocumentNode;

  constructor(input: { name: string; document: DocumentNode }) {
    this.name = input.name;
    this.document = input.document;
  }
}

export = Model;
