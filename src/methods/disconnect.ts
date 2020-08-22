import { Runtime } from "../types";

function disconnect(runtime: Runtime) {
  return async (): Promise<void> => {
    if (runtime.connection) {
      await runtime.connection.driver.close();

      runtime.connection = null;
    }
  };
}

export = disconnect;
