import { Model } from "../classes";
import { SessionOptions, Query } from "../types";

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
    LIMIT 1
  `;

  try {
    const result = await session.run(cypher, { node: query });

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
