import { Model, Query } from "../types";
import createWhereAndParams from "./create-where-and-params";

async function count({
  model,
  query,
}: {
  model: Model;
  query: Query;
}): Promise<number> {
  const session = model.getSession("READ");

  let params = {};
  const match = `MATCH (n:${model.name})`;
  let where;

  if (Object.keys(query).length) {
    const w = createWhereAndParams({ model, query });

    params = { ...w.params };
    where = w.where;
  }

  const cypher = `
    ${match}
    ${where}
    WITH COUNT(n) as count
    RETURN count
   `;

  try {
    const result = await session.run(cypher, params);

    const c = result.records[0].get("count");

    return c.low || c.high;
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = count;
