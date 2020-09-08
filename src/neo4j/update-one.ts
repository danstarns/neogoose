import {
  Model,
  FindOneInput,
  UpdateOneOptions,
  SessionOptions,
} from "../types";

async function updateOne<T = any>({
  model,
  query,
  update,
  set,
  options,
}: {
  model: Model;
  query: FindOneInput;
  update?: any;
  set?: any;
  options: UpdateOneOptions;
}): Promise<T | any> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "WRITE" };

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
    WITH n LIMIT 1
    ${update ? `SET n = $update` : ""}
    ${set ? `SET n += $set` : ""}
    ${options.return ? `RETURN n` : ""}
  `;

  try {
    const result = await session.run(cypher, { node: query, update, set });

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
