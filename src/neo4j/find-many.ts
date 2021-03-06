import { Model } from "../classes";
import { Query, FindManyOptions } from "../types";
import createWhereAndParams from "./create-where-and-params";

async function findMany<T = any>({
  model,
  query,
  options,
}: {
  model: Model;
  query: Query;
  options: FindManyOptions;
}): Promise<T[]> {
  const session = model.getSession("READ");

  let params = {};
  const match = `MATCH (n:${model.name})`;
  let where;
  const pagination = `
    ${options.skip ? `SKIP ${options.skip}` : ""}
    ${options.limit ? `LIMIT ${options.limit}` : ""}
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

    return result.records.map((record) => record.get("n").properties);
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = findMany;
