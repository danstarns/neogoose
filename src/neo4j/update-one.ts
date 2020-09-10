import { Model, Query, UpdateOneOptions } from "../types";
import createWhereAndParams from "./create-where-and-params";

async function updateOne<T = any>({
  model,
  query,
  update,
  set,
  options,
}: {
  model: Model;
  query: Query;
  update?: any;
  set?: any;
  options: UpdateOneOptions;
}): Promise<T | any> {
  const session = model.getSession("WRITE");

  let params = { update, set };
  const match = `MATCH (n:${model.name})`;
  let where;

  if (Object.keys(query).length) {
    const w = createWhereAndParams({ model, query });

    params = { ...params, ...w.params };
    where = w.where;
  }

  const cypher = `
    ${match}
    ${where}
    WITH n LIMIT 1
    ${update ? `SET n = $update` : ""}
    ${set ? `SET n += $set` : ""}
    ${options.return ? `RETURN n` : ""}
  `;

  try {
    const result = await session.run(cypher, params);

    if (options.return) {
      const node = result.records[0];

      if (node) {
        return node.get("n").properties as T;
      }
    }
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = updateOne;
