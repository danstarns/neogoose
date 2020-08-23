import { Runtime, SessionOptions } from "../types";
import { Session } from "neo4j-driver";

function session(runtime: Runtime) {
  return (options: SessionOptions = {}): Session | null => {
    if (!runtime.connection) {
      return null;
    }

    return runtime.connection.driver.session(options);
  };
}

export = session;
