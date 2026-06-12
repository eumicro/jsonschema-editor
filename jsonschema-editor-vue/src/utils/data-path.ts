import type {
  CompositionSchema,
  ObjectSchema,
  SchemaNode,
} from "@jsonschema-editor/json-schema";
import { toRaw } from "vue";

export function getValueAtPath(data: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = data;
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function setValueAtPath(
  data: Record<string, unknown>,
  path: string[],
  value: unknown,
): Record<string, unknown> {
  const clone = structuredClone(toRaw(data) as Record<string, unknown>);
  let current: Record<string, unknown> = clone;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const next = current[key];
    if (next === undefined || typeof next !== "object" || next === null) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[path[path.length - 1]] = value;
  return clone;
}

export function createEmptyDataForSchema(schema: SchemaNode): Record<string, unknown> {
  if (schema.kind === "object") {
    const obj = schema as ObjectSchema;
    const data: Record<string, unknown> = {};
    for (const [name, propSchema] of obj.properties) {
      data[name] = defaultForSchema(propSchema);
    }
    return data;
  }
  return {};
}

function defaultForSchema(schema: SchemaNode): unknown {
  if (schema.defaultValue !== undefined) return schema.defaultValue;
  if (schema.constValue !== undefined) return schema.constValue;

  switch (schema.kind) {
    case "string":
      return "";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object": {
      const obj = schema as ObjectSchema;
      const data: Record<string, unknown> = {};
      for (const [name, prop] of obj.properties) {
        data[name] = defaultForSchema(prop);
      }
      return data;
    }
    case "composition": {
      const comp = schema as CompositionSchema;
      const data: Record<string, unknown> = {};
      for (const branch of comp.allOf) {
        if (branch.kind === "object") {
          Object.assign(data, createEmptyDataForSchema(branch));
        }
      }
      const variant = comp.oneOf[0] ?? comp.anyOf[0];
      if (variant?.kind === "object") {
        Object.assign(data, createEmptyDataForSchema(variant));
      }
      if (Object.keys(data).length > 0) return data;
      return createEmptyDataForSchema(comp.branches[0] ?? schema);
    }
    default:
      return null;
  }
}
