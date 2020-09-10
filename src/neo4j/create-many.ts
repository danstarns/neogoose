import { Model } from "../classes";
import { SessionOptions, CreateOptions } from "../types";
import { generate } from "randomstring";

async function createMany<T = any>({
  model,
  options,
  params,
}: {
  model: Model;
  options: CreateOptions;
  params: any[];
}): Promise<T[]> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "WRITE" };

  if (model.sessionOptions) {
    sessionOptions = model.sessionOptions;
  }

  const session = connection.driver.session(sessionOptions);

  if (!params.length) {
    return;
  }

  let cypher = `CREATE`;
  const cypherParams = {};
  const ids = [];

  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const next = params[i + 1];

    const id = generate({
      charset: "alphabetic",
    });
    ids.push(id);

    cypherParams[id] = param;

    cypher += `(${id}:${model.name} $${id})${next ? "," : ""}`;
  }

  if (options.return) {
    cypher += `
      RETURN ${ids
        .map((id, i) => {
          const next = ids[i + i];

          return `${id}${next ? "," : ""}`;
        })
        .join("")}
      `;
  }

  try {
    const result = await session.run(cypher, cypherParams);

    if (options.return) {
      return ids.map((id) => {
        const record = result.records.find((x) => x.has(id));

        return record.get(id).properties;
      });
    }
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = createMany;
