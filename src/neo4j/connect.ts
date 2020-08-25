import {
  AuthToken,
  Config,
  driver as createDriver,
  Driver,
} from "neo4j-driver";

async function connect(
  url: string,
  authToken?: AuthToken,
  config?: Config
): Promise<Driver> {
  const driver = createDriver(url, authToken, config);

  await driver.verifyConnectivity();

  return driver;
}

export = connect;
