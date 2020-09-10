import { Model } from "../classes";
import { SessionOptions, CreateOptions } from "../types";

async function createOne<T = any>({
  model,
  options,
  params,
}: {
  model: Model;
  options: CreateOptions;
  params: any;
}): Promise<T> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "WRITE" };

  if (model.sessionOptions) {
    sessionOptions = model.sessionOptions;
  }

  const session = connection.driver.session(sessionOptions);

  const keys = Object.keys(params);

  let properties = `{`;

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const next = keys[i + 1];

    properties += `${k}: $node.${k}${next ? "," : ""}`;
  }

  properties += " }";

  const cypher = `
    CREATE (n:${model.name} ${properties})
    ${options.return ? "RETURN n" : ""}
  `;

  try {
    const result = await session.run(cypher, { node: params });

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

export = createOne;
