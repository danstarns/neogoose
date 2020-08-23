import { Driver, Config } from "neo4j-driver";

interface ConnectionInput {
  driver: Driver;
  config: Config;
}

class Connection {
  public driver: Driver;
  public config: Config;

  constructor(input: ConnectionInput) {
    this.driver = input.driver;
    this.config = input.config;
  }
}

export = Connection;
