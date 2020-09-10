import { Model } from "../classes";
import { Query } from "../types";
import createWhereAndParams from "./create-where-and-params";

async function findOne<T = any>({
  model,
  query,
}: {
  model: Model;
  query: Query;
}): Promise<T> {
  const session = model.getSession("READ");

  let params = {};
  const match = `MATCH (n:${model.name})`;
  let where;
  const pagination = `
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
    RETURN n
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
