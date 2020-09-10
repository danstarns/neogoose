import { Runtime, CreateConnection } from "../types";
import { Connection } from "../classes";
import * as neo4j from "../neo4j";

function createConnection(runtime: Runtime): CreateConnection {
  return async (url, authToken, config) => {
    const driver = await neo4j.connect(url, authToken, config);

    const connection = new Connection({
      driver,
      config,
    });

    runtime.connections.push(connection);

    return connection;
  };
}

export = createConnection;
