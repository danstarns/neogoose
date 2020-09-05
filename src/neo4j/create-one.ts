import { Model } from "../classes";
import { CreateOneInput, SessionOptions } from "../types";
import { getFieldTypeName, getRelationshipDirective } from "../graphql";
import { generate } from "randomstring";

interface Node {
  uuid: string;
  model: Model;
  properties?: any;
}

interface Relationship {
  uuid: string;
  from: string; // uuid
  to: string; // uuid
  properties?: any;
  direction: "OUT" | "IN";
  label: string;
}

async function createOne({
  model,
  input,
}: {
  model: Model;
  input: CreateOneInput;
}): Promise<void> {
  const connection = model.runtime.connection;

  let sessionOptions: SessionOptions = { defaultAccessMode: "WRITE" };

  if (model.sessionOptions) {
    sessionOptions = model.sessionOptions;
  }

  const session = connection.driver.session(sessionOptions);

  function getInputs(obj, m: Model) {
    const reducer = (res, f) => {
      const incoming = obj[f.name.value];

      if (!incoming) {
        return res;
      }

      return { ...res, [f.name.value]: incoming };
    };

    if (m.properties) {
      return m.properties.fields.reduce(reducer, {});
    } else {
      return m.fields.reduce(reducer, {});
    }
  }

  function getNodesToCreate(obj, m: Model): Node[] {
    const x = Object.entries(obj).reduce((r, [key, value]: [string, any]) => {
      const relation = m.relations.find((x) => x.name.value === key);
      if (!relation) {
        return r;
      }

      const to = m.runtime.models.find(
        (x) => x.name === getFieldTypeName(relation).name
      );

      if (Array.isArray(value)) {
        const recurse = value.reduce((_r, v) => {
          return [..._r, ...getNodesToCreate(v.node, to)];
        }, []);

        return [...r, ...recurse];
      }

      let properties = value;

      if (value.node) {
        properties = getInputs(value.node, to);
      } else {
        properties = getInputs(value, to);
      }

      return [
        ...r,
        {
          uuid: generate({
            charset: "alphabetic",
          }),
          model: to,
          ...(properties ? { properties } : {}),
        },
      ];
    }, []);

    return x as Node[];
  }

  function getRelationsToCreate(obj, m: Model): Relationship[] {
    const x = Object.entries(obj).reduce((r, [key, value]: [string, any]) => {
      const relation = m.relations.find((x) => x.name.value === key);
      if (!relation) {
        return r;
      }

      const to = m.runtime.models.find(
        (x) => x.name === getFieldTypeName(relation).name
      );

      if (Array.isArray(value)) {
        const recurse = value.reduce((_r, v) => {
          return [..._r, ...getRelationsToCreate(v.node, to)];
        }, []);

        return [...r, ...recurse];
      }

      const properties = value.properties;
      let label;
      let direction = "OUT";
      const relDirec = getRelationshipDirective(relation);

      const directionArg = relDirec.arguments.find(
        (x) => x.name.value === "direction"
      );

      if (directionArg) {
        direction = directionArg.name.value;
      }

      const labelArg = relDirec.arguments.find((x) => x.name.value === "label");

      if (labelArg) {
        label = labelArg.name.value;
      }

      return [
        ...r,
        {
          uuid: generate({
            charset: "alphabetic",
          }),
          from: m,
          to: to,
          properties,
          direction,
          label,
        },
      ];
    }, []);

    return x as Relationship[];
  }

  let query = `CREATE (this:${model.name} $node)`;
  const params = { node: getInputs(input, model) };
  const nodesToCreate = getNodesToCreate(input, model) as Node[];
  const relationsToCreate = getRelationsToCreate(
    input,
    model
  ) as Relationship[];

  nodesToCreate.forEach((n) => {
    const props = n.properties // fix
      ? `$${n.uuid}`
      : "";

    if (n.properties) {
      params[n.uuid] = n.properties;
    }

    query += `,(${n.uuid}:${n.model.name} ${props})`;
  });

  query += "\n";

  relationsToCreate.forEach((r) => {
    const label = r.label ? `:${r.label}` : "";

    const props = r.properties // fix
      ? `$${r.uuid}`
      : "";

    if (r.direction === "IN") {
      query += `MERGE (${r.from})<-[${label} ${props}]-(${r.to})`;
    } else {
      query += `MERGE (${r.to})-[${label} ${props}]->(${r.from})`;
    }

    query += "\n";
  });

  console.log(query);
  console.log(JSON.stringify(params, null, 2));

  try {
    const result = await session.run(query, params);
    console.log(result);
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
}

export = createOne;
