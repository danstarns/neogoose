import * as neo4j from "neo4j-driver";
import { default as neogoose } from "../../src";
import * as util from "util";

let driver;

async function Connect(): Promise<neo4j.Driver> {
  if (driver) {
    return driver;
  }

  /* Compose and CircCI

    'depends_on:
      - testneo4j'

    does not work :/
  */
  if (process.env.NEO_WAIT) {
    await util.promisify(setTimeout)(Number(process.env.NEO_WAIT));
  }

  const auth = neo4j.auth.basic(process.env.NEO_USER, process.env.NEO_PASSWORD);

  driver = neo4j.driver(process.env.NEO_URL, auth);

  await driver.verifyConnectivity();

  await neogoose.connect(process.env.NEO_URL, auth);

  return driver;
}

export = Connect;
