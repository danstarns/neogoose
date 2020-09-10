import { Model, Query, UpdateManyOptions, SessionOptions } from "../types";
import createWhereAndParams from "./create-where-and-params";

async function updateMany<T = any>({
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
  options: UpdateManyOptions;
}): Promise<T[]> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "WRITE" };

  if (model.sessionOptions) {
    sessionOptions = model.sessionOptions;
  }

  const session = connection.driver.session(sessionOptions);

  let params = { update, set };
  const match = `MATCH (n:${model.name})`;
  let where;

  const skip = `${options.skip ? `SKIP ${options.skip}` : ""}`;
  const limit = `${options.limit ? `LIMIT ${options.limit}` : ""}`;

  if (Object.keys(query).length) {
    const w = createWhereAndParams({ model, query });

    params = { ...params, ...w.params };
    where = w.where;
  }

  const cypher = `
    ${match}
    ${where}
    WITH n ${skip} ${limit}
    ${update ? `SET n = $update` : ""}
    ${set ? `SET n += $set` : ""}
    ${options.return ? `RETURN n` : ""}
  `;

  try {
    const result = await session.run(cypher, params);

    if (options.return) {
      return result.records.map((record) => record.get("n").properties);
    }
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = updateMany;
