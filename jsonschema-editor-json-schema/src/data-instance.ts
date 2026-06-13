import type { CompositionSchema, ObjectSchema, SchemaNode } from "./model/index.js";

function isArrayIndex(key: string): boolean {
  return /^\d+$/.test(key);
}

function readSegment(current: unknown, key: string): unknown {
  if (current === null || current === undefined) {
    return undefined;
  }
  if (Array.isArray(current)) {
    if (!isArrayIndex(key)) return undefined;
    return current[Number(key)];
  }
  if (typeof current === "object") {
    return (current as Record<string, unknown>)[key];
  }
  return undefined;
}

function ensureContainer(current: Record<string, unknown>, key: string, nextKey?: string): unknown {
  const existing = current[key];
  if (existing !== undefined && existing !== null && typeof existing === "object") {
    return existing;
  }
  const created = nextKey !== undefined && isArrayIndex(nextKey) ? [] : {};
  current[key] = created;
  return created;
}

/** Reads a value from form/instance data using a path from {@link parseScope}. */
export function getValueAtPath(data: Record<string, unknown>, path: readonly string[]): unknown {
  let current: unknown = data;
  for (const key of path) {
    current = readSegment(current, key);
    if (current === undefined) {
      return undefined;
    }
  }
  return current;
}

function cloneFormDataRoot(data: Record<string, unknown>): Record<string, unknown> {
  try {
    return structuredClone(data);
  } catch {
    return JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  }
}

/** Immutably writes a value into form/instance data. Returns a cloned root object. */
export function setValueAtPath(
  data: Record<string, unknown>,
  path: readonly string[],
  value: unknown,
): Record<string, unknown> {
  if (path.length === 0) {
    return data;
  }

  const clone = cloneFormDataRoot(data);
  let current: unknown = clone;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKey = path[i + 1];

    if (Array.isArray(current)) {
      if (!isArrayIndex(key)) {
        throw new Error(`Expected array index, got "${key}".`);
      }
      const index = Number(key);
      while (current.length <= index) {
        current.push(undefined);
      }
      if (
        current[index] === undefined ||
        current[index] === null ||
        typeof current[index] !== "object"
      ) {
        current[index] = nextKey !== undefined && isArrayIndex(nextKey) ? [] : {};
      }
      current = current[index];
      continue;
    }

    const record = current as Record<string, unknown>;
    current = ensureContainer(record, key, nextKey);
  }

  const lastKey = path[path.length - 1];
  if (Array.isArray(current)) {
    if (!isArrayIndex(lastKey)) {
      throw new Error(`Expected array index, got "${lastKey}".`);
    }
    const index = Number(lastKey);
    while (current.length <= index) {
      current.push(undefined);
    }
    current[index] = value;
    return clone;
  }

  (current as Record<string, unknown>)[lastKey] = value;
  return clone;
}

/** Creates a default JSON instance value for a schema node (respects `default` / `const`). */
export function createDefaultForSchema(schema: SchemaNode): unknown {
  if (schema.defaultValue !== undefined) return schema.defaultValue;
  if (schema.constValue !== undefined) return schema.constValue;
  return schema.createDefaultValue();
}

/** Creates default instance data for an object schema root. */
export function createEmptyDataForSchema(schema: SchemaNode): Record<string, unknown> {
  if (schema.kind === "object") {
    const obj = schema as ObjectSchema;
    const data: Record<string, unknown> = {};
    for (const [name, propSchema] of obj.properties) {
      data[name] = createDefaultForSchema(propSchema);
    }
    return data;
  }

  if (schema.kind === "composition") {
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
    if (Object.keys(data).length > 0) {
      return data;
    }
  }

  const value = createDefaultForSchema(schema);
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Normalizes an array field value; returns `[]` when missing or wrong type. */
export function normalizeArrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}
