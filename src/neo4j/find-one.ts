import { Model } from "../classes";
import { FindOneInput, SessionOptions } from "../types";

async function findOne<T = any>({
  model,
  input,
}: {
  model: Model;
  input: FindOneInput;
}): Promise<T> {
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
    LIMIT 1
  `;

  try {
    const result = await session.run(query, { node: input });

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
