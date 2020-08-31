import { FieldDefinitionNode } from "graphql";

interface Result {
  name: string;
  array: boolean;
  required: boolean;
  pretty: string;
  prettyBy(str: string): string;
}

function getFieldTypeName(field: FieldDefinitionNode): Result {
  switch (field.type.kind) {
    case "NonNullType": {
      switch (field.type.type.kind) {
        case "ListType":
          return {
            // @ts-ignore
            name: field.type.type.type.name.value,
            array: true,
            required: true,
            // @ts-ignore
            pretty: `[${field.type.type.type.name.value}]!`,
            prettyBy: (s) => `[${s}]!`,
          };

        case "NamedType":
          return {
            name: field.type.type.name.value,
            array: false,
            required: true,
            pretty: `${field.type.type.name.value}!`,
            prettyBy: (s) => `${s}!`,
          };
      }
    }

    case "NamedType": {
      return {
        name: field.type.name.value,
        array: false,
        required: false,
        pretty: `${field.type.name.value}`,
        prettyBy: (s) => s,
      };
    }

    case "ListType": {
      switch (field.type.type.kind) {
        case "NamedType": {
          return {
            // @ts-ignore
            name: field.type.type.name.value,
            array: true,
            required: false,
            pretty: `[${field.type.type.name.value}]`,
            prettyBy: (s) => `[${s}]`,
          };
        }

        case "NonNullType": {
          return {
            // @ts-ignore
            name: field.type.type.type.name.value,
            array: true,
            required: true,
            // @ts-ignore
            pretty: `[${field.type.type.type.name.value}!]`,
            prettyBy: (s) => `[${s}!]`,
          };
        }
      }
    }
  }
}

export = getFieldTypeName;
