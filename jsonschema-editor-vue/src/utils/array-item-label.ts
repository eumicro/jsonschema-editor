import {
  ObjectSchema,
  type SchemaDocument,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";
import { resolveControlDetailSchema } from "@jsonschema-editor/ui-schema";
import { resolveSchemaAtScope } from "@jsonschema-editor/ui-schema/bridge";

/** JSON Forms `options.elementLabelProp` — property path or single name. */
export type ElementLabelProp = string | readonly string[];

export function readElementLabelProp(
  options: Readonly<Record<string, unknown>> | undefined,
): ElementLabelProp | undefined {
  const raw = options?.elementLabelProp;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && raw.every((p) => typeof p === "string") && raw.length > 0) {
    return raw as string[];
  }
  return undefined;
}

function getByPath(data: unknown, path: readonly string[]): unknown {
  let current: unknown = data;
  for (const segment of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function setByPath(
  data: Record<string, unknown>,
  path: readonly string[],
  value: string,
): Record<string, unknown> {
  if (path.length === 0) return data;
  const next = { ...data };
  if (path.length === 1) {
    next[path[0]] = value;
    return next;
  }
  const [head, ...rest] = path;
  const child = next[head];
  const childObj =
    child && typeof child === "object" && !Array.isArray(child)
      ? (child as Record<string, unknown>)
      : {};
  next[head] = setByPath(childObj, rest, value);
  return next;
}

export function elementLabelPropPath(prop: ElementLabelProp): string[] {
  if (typeof prop === "string") return prop.split(".").filter(Boolean);
  return [...prop];
}

/** First primitive property name of an object schema (JSON Forms default). */
export function firstPrimitivePropertyName(schema: SchemaNode | undefined): string | undefined {
  if (!(schema instanceof ObjectSchema)) return undefined;
  for (const [name, prop] of schema.properties) {
    const kind = prop.nodeKind;
    if (kind === "string" || kind === "number" || kind === "integer" || kind === "boolean") {
      return name;
    }
  }
  return undefined;
}

export function resolveItemLabelProp(
  options: Readonly<Record<string, unknown>> | undefined,
  itemSchema: SchemaNode | undefined,
): ElementLabelProp | undefined {
  return readElementLabelProp(options) ?? firstPrimitivePropertyName(itemSchema);
}

export function getArrayItemLabelValue(
  item: unknown,
  prop: ElementLabelProp | undefined,
): string {
  if (!prop || !item || typeof item !== "object" || Array.isArray(item)) return "";
  const value = getByPath(item, elementLabelPropPath(prop));
  if (value === undefined || value === null) return "";
  return String(value);
}

export function setArrayItemLabelValue(
  item: unknown,
  prop: ElementLabelProp,
  value: string,
): Record<string, unknown> {
  const base =
    item && typeof item === "object" && !Array.isArray(item)
      ? { ...(item as Record<string, unknown>) }
      : {};
  return setByPath(base, elementLabelPropPath(prop), value);
}

export function listElementLabelPropSuggestions(
  document: SchemaDocument | undefined | null,
  controlScope: string,
): string[] {
  const itemSchema = resolveControlDetailSchema(document, controlScope);
  if (!(itemSchema instanceof ObjectSchema)) return [];
  const names: string[] = [];
  for (const [name, prop] of itemSchema.properties) {
    const kind = prop.nodeKind;
    if (kind === "string" || kind === "number" || kind === "integer" || kind === "boolean") {
      names.push(name);
    }
  }
  return names;
}

export function isArrayControlScope(
  document: SchemaDocument | undefined | null,
  controlScope: string,
): boolean {
  if (!document) return false;
  const resolveRef = (ref: string) => document.resolveRef(ref);
  const node = resolveSchemaAtScope(document.root, controlScope, resolveRef);
  return node?.nodeKind === "array";
}
