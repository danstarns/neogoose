import { Model, Query } from "../types";
import { generate } from "randomstring";

function createWhereAndParams({
  model,
  query,
  parent,
}: {
  model: Model;
  query: Query;
  parent?: string;
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

    if (!Array.isArray(v) && Object.keys(v).length && typeof v !== "string") {
      const r = createWhereAndParams({ model, query: v, parent: k });

      const whereGone = r.where.replace("WHERE", "");

      where = where + ` (${whereGone})`;

      params.node = { ...params.node, ...r.params.node };
    } else {
      const key = parent ? parent : k;
      const id = generate({
        charset: "alphabetic",
      });

      switch (k) {
        /*  Comparison Operators */
        case "$eq":
          where = where + ` n.${key} = $node.${id}`;
          params.node[id] = v;
          break;
        case "$gt":
          where = where + ` n.${key} > $node.${id}`;
          params.node[id] = v;
          break;
        case "$gte":
          where = where + ` n.${key} >= $node.${id}`;
          params.node[id] = v;
          break;
        case "$in":
          where = where + ` n.${key} IN $node.${id}`;
          params.node[id] = v;
          break;
        case "$lt":
          where = where + ` n.${key} < $node.${id}`;
          params.node[id] = v;
          break;
        case "$lte":
          where = where + ` n.${key} <= $node.${id}`;
          params.node[id] = v;
          break;
        case "$ne":
          where = where + ` n.${key} <> $node.${id}`;
          params.node[id] = v;
          break;
        case "$nin":
          where = where + ` NOT n.${key} IN $node.${id}`;
          params.node[id] = v;
          break;

        /* Logical Operators */
        case "$and":
          where = where + ` (`;

          for (let ii = 0; ii < v.length; ii++) {
            const and = v[ii];
            const n = v[ii + 1];

            const r = createWhereAndParams({ model, query: and, parent });

            const whereGone = r.where.replace("WHERE", "");

            where = where + ` (${whereGone})`;

            params.node = { ...params.node, ...r.params.node };

            if (n) {
              where = where + " AND";
            }
          }

          where = where + ` )`;

          break;
        case "$or":
          where = where + ` (`;

          for (let ii = 0; ii < v.length; ii++) {
            const and = v[ii];
            const n = v[ii + 1];

            const r = createWhereAndParams({ model, query: and, parent });

            const whereGone = r.where.replace("WHERE", "");

            where = where + ` (${whereGone})`;

            params.node = { ...params.node, ...r.params.node };

            if (n) {
              where = where + " OR";
            }
          }

          where = where + ` )`;
          break;

        /*  Evaluation Operators */
        case "$regex":
          where = where + ` n.${key} =~ $node.${id}`;
          params.node[id] = v;
          break;

        default:
          where = where + ` n.${key} = $node.${id}`;
          params.node[id] = v;
      }
    }

    if (next) {
      where = where + " AND";
    }
  }

  return {
    params,
    where,
  };
}

export = createWhereAndParams;
