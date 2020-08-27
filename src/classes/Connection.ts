import { Driver, Config } from "neo4j-driver";

export interface ConnectionInput {
  driver: Driver;
  config: Config;
}

export default class Connection {
  public driver: Driver;
  public config: Config;

  constructor(input: ConnectionInput) {
    this.driver = input.driver;
    this.config = input.config;
  }
}
