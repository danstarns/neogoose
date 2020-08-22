import { Connection, Model } from "./classes";

export type Runtime = {
  models: Model[];
  connections: Connection[];
};
