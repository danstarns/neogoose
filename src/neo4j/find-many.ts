import { Model } from "../classes";
import { Query, FindManyOptions, SessionOptions } from "../types";

async function findMany<T = any>({
  model,
  input,
  options,
}: {
  model: Model;
  input: Query;
  options: FindManyOptions;
}): Promise<T[]> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "READ" };

  if (model.sessionOptions) {
    sessionOptions = model.sessionOptions;
  }

  const session = connection.driver.session(sessionOptions);

  const keys = Object.keys(input);

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

  const query = `
      MATCH (n:${model.name} ${keys.length ? createParams() : ""})
      RETURN n
      ${options.skip ? `SKIP ${options.skip}` : ""}
      ${options.limit ? `LIMIT ${options.limit}` : ""}
    `;

  try {
    const result = await session.run(query, { node: input });

    return result.records.map((record) => record.get("n").properties);
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = findMany;
