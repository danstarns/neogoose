import { Runtime } from "../types";
import { Session, SessionMode } from "neo4j-driver";

function session(runtime: Runtime) {
  return ({
    defaultAccessMode,
    bookmarks,
    database,
    fetchSize,
  }: {
    defaultAccessMode?: SessionMode;
    bookmarks?: string | string[];
    fetchSize?: number;
    database?: string;
  } = {}): null | Session => {
    if (!runtime.connection) {
      return null;
    }

    return runtime.connection.driver.session({
      defaultAccessMode,
      bookmarks,
      database,
      fetchSize,
    });
  };
}

export = session;
