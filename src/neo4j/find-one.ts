import { Model } from "../classes";
import { SessionOptions, Query } from "../types";
import createWhereAndParams from "./create-where-and-params";

async function findOne<T = any>({
  model,
  query,
}: {
  model: Model;
  query: Query;
}): Promise<T> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "READ" };

  if (model.sessionOptions) {
    sessionOptions = model.sessionOptions;
  }

  const session = connection.driver.session(sessionOptions);

  let params = {};
  const match = `MATCH (n:${model.name})`;
  let where;
  const pagination = `
    RETURN n
    LIMIT 1
  `;

  if (Object.keys(query).length) {
    const w = createWhereAndParams({ model, query });

    params = { ...w.params };
    where = w.where;
  }

  const cypher = `
    ${match}
    ${where}
    ${pagination}
  `;

  try {
    const result = await session.run(cypher, params);

    const node = result.records[0];

    if (node) {
      return node.get("n").properties as T;
    }
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = findOne;
