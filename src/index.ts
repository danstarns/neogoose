import { Runtime } from "./types";
import {
  model,
  connect,
  createConnection,
  disconnect,
  session,
} from "./methods";

const runtime: Runtime = {};

export = {
  model: model(runtime),
  connect: connect(runtime),
  createConnection: createConnection(runtime),
  disconnect: disconnect(runtime),
  session: session(runtime),
};
