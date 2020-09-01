import { ConnectionInput } from "../types";
import { Config, Driver } from "neo4j-driver";

export default class Connection {
  public driver: Driver;
  public config: Config;

  constructor(input: ConnectionInput) {
    this.driver = input.driver;
    this.config = input.config;
  }
}
