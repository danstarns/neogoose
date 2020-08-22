import { Runtime } from "./types";
import { model, connect } from "./methods";

const runtime: Runtime = {};

export = {
  model: model(runtime),
  connect: connect(runtime),
};
