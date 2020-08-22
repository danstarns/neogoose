import { Runtime } from "./types";
import {
  model,
  connect,
  createConnection,
  disconnect,
  session,
} from "./methods";

const runtime: Runtime = {
  models: [],
  connections: [],
};

export = {
  model: model(runtime),
  connect: connect(runtime),
  createConnection: createConnection(runtime),
  disconnect: disconnect(runtime),
  session: session(runtime),
};
