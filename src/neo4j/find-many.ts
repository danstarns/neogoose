import { Model } from "../classes";
import { Query, FindManyOptions, SessionOptions } from "../types";

async function findMany<T = any>({
  model,
  query,
  options,
}: {
  model: Model;
  query: Query;
  options: FindManyOptions;
}): Promise<T[]> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "READ" };

  if (model.sessionOptions) {
    sessionOptions = model.sessionOptions;
  }

  const session = connection.driver.session(sessionOptions);

  const keys = Object.keys(query);

  function createParams() {
    let params = `{`;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const next = keys[i + 1];

      params += `${k}: $node.${k}${next ? "," : ""}`;
    }

    params += "}";

    return params;
  }

  const cypher = `
      MATCH (n:${model.name} ${keys.length ? createParams() : ""})
      RETURN n
      ${options.skip ? `SKIP ${options.skip}` : ""}
      ${options.limit ? `LIMIT ${options.limit}` : ""}
    `;

  try {
    const result = await session.run(cypher, { node: query });

    return result.records.map((record) => record.get("n").properties);
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = findMany;
