import { Model, Query } from "../types";

function createWhereAndParams({
  model,
  query,
}: {
  model: Model;
  query: Query;
}): { params: any; where: string } {
  const params = {
    node: {},
  };

  let where = `WHERE`;

  const keys = Object.keys(query);

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = query[k];
    const next = keys[i + 1];

    if (v.$in) {
      where = where + ` n.${k} IN $node.${k} ${next ? "AND" : ""}`;
      params.node[k] = v.$in;
    } else {
      where = where + ` n.${k} = $node.${k} ${next ? "AND" : ""}`;
      params.node[k] = v;
    }
  }

  return {
    params,
    where,
  };
}

export = createWhereAndParams;
