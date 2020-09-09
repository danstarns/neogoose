import { Model } from "../classes";
import { Query, DeleteOneOptions, SessionOptions } from "../types";

async function deleteOne<T = any>({
  model,
  input,
  options,
}: {
  model: Model;
  input: Query;
  options: DeleteOneOptions;
}): Promise<T | void> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "WRITE" };

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
    WITH n LIMIT 1
    ${options.detach ? "DETACH" : ""} DELETE n
    ${options.return ? "RETURN n" : ""}
  `;

  try {
    const result = await session.run(query, { node: input });

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
