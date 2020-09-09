import { Model, Query, DeleteManyOptions, SessionOptions } from "../types";

async function deleteMany<T = any>({
  model,
  input,
  options,
}: {
  model: Model;
  input: Query;
  options: DeleteManyOptions;
}): Promise<T[] | void> {
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

  const limit = options.limit ? `LIMIT ${options.limit}` : "";
  const skip = options.skip ? `SKIP ${options.skip}` : "";

  const query = `
    MATCH (n:${model.name} ${keys.length ? createParams() : ""})
    WITH n ${skip} ${limit}
    ${options.detach ? "DETACH" : ""} DELETE n
    ${options.return ? "RETURN n" : ""}
  `;

  try {
    const result = await session.run(query, { node: input });

    if (options.return) {
      return result.records.map((record) => record.get("n").properties);
    }
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = deleteMany;
