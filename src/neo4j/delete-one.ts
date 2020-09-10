import { Model } from "../classes";
import { Query, DeleteOneOptions } from "../types";
import createWhereAndParams from "./create-where-and-params";

async function deleteOne<T = any>({
  model,
  query,
  options,
}: {
  model: Model;
  query: Query;
  options: DeleteOneOptions;
}): Promise<T | void> {
  const session = model.getSession("WRITE");

  let params = {};
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
    ${options.detach ? "DETACH" : ""} DELETE n
    ${options.return ? "RETURN n" : ""}
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

export = deleteOne;
