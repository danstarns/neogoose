import { Driver, Config } from "neo4j-driver";

interface ConnectionOptions {
  driver: Driver;
  config: Config;
}

class Connection {
  public driver: Driver;
  public config: Config;

  constructor(options: ConnectionOptions) {
    this.driver = options.driver;
    this.config = options.config;
  }
}

export = Connection;
