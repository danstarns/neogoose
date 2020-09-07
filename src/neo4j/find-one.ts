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

  function createParams() {
    let params = `{`;

    const keys = Object.keys(input);

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const next = keys[i + 1];

      params += `${k}: $node.${k}${next ? "," : ""}`;
    }

    params += "}";

    return params;
  }

  const query = `
    MATCH (n:${model.name} ${createParams()})
    RETURN n
    LIMIT 1
  `;

  try {
    const result = await session.run(query, { node: input });

    const properties = result.records[0].get("n").properties as T;

    return properties;
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = findOne;
