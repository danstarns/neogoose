import { Runtime } from "../types";
import { AuthToken, Config } from "neo4j-driver";
import { Connection } from "../classes";
import * as neo4j from "../neo4j";
import { createValidationSchema } from "../graphql";

function connect(runtime: Runtime) {
  return async (
    url: string,
    authToken?: AuthToken,
    config?: Config
  ): Promise<Connection> => {
    const driver = await neo4j.connect(url, authToken, config);

    const connection = new Connection({
      driver,
      config,
    });

    runtime.connection = connection;

    runtime.validationSchema = createValidationSchema({ runtime });

    return connection;
  };
}

export = connect;
