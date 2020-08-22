import { Runtime } from "../types";
import { Session } from "neo4j-driver";

function session(runtime: Runtime) {
  return (): null | Session => {
    if (!runtime.connection) {
      return null;
    }

    return runtime.connection.driver.session();
  };
}

export = session;
