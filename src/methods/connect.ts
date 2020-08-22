import { Runtime } from "../types";
import { AuthToken, Config, driver as createDriver } from "neo4j-driver";
import { Connection } from "../classes";

function connect(runtime: Runtime) {
  return async (
    url: string,
    authToken?: AuthToken,
    config?: Config
  ): Promise<Connection> => {
    const driver = createDriver(url, authToken, config);

    await driver.verifyConnectivity();

    const connection = new Connection({
      driver,
      config,
    });

    runtime.connections.push(connection);

    return connection;
  };
}

export = connect;
