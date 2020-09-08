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

  try {
    const auth = neo4j.auth.basic(
      process.env.NEO_USER,
      process.env.NEO_PASSWORD
    );

    console.log("Connecting to neo4j " + process.env.NEO_URL);
    console.log("With user " + process.env.NEO_USER);

    driver = neo4j.driver(process.env.NEO_URL, auth);

    await driver.verifyConnectivity();

    await neogoose.connect(process.env.NEO_URL, auth);

    return driver;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export = Connect;
