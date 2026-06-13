import type { JsonSchemaAttributeRegistry, SchemaNode, StringSchema } from "@jsonschema-editor/json-schema";
import { StringSchema as StringSchemaClass } from "@jsonschema-editor/json-schema";
import { defaultExtensionsRegistry } from "./registry.js";

export const VALUES_SOURCE_ATTRIBUTE = "x-values-source";

export interface StaticValuesSource {
  kind: "static";
  values: string[];
}

export interface FetchValuesSource {
  kind: "fetch";
  url: string;
  /** Dot path to the array in a JSON object response. */
  itemsPath?: string;
  valueField?: string;
  labelField?: string;
}

export type ValuesSourceConfig = StaticValuesSource | FetchValuesSource;

export function isStaticValuesSource(value: unknown): value is StaticValuesSource {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.kind === "static" && Array.isArray(record.values);
}

export function isFetchValuesSource(value: unknown): value is FetchValuesSource {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.kind === "fetch" && typeof record.url === "string" && record.url.length > 0;
}

export function isValuesSourceConfig(value: unknown): value is ValuesSourceConfig {
  return isStaticValuesSource(value) || isFetchValuesSource(value);
}

export function readValuesSourceConfig(node: SchemaNode): ValuesSourceConfig | undefined {
  const raw = node.getCustomAttribute(VALUES_SOURCE_ATTRIBUTE);
  return isValuesSourceConfig(raw) ? raw : undefined;
}

export function createStaticValuesSourceSchema(
  values: string[] = ["Option A", "Option B"],
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): StringSchema {
  const schema = new StringSchemaClass(registry);
  schema.title = "Selection";
  schema.description = "Value from a predefined list.";
  schema.enumValues = [...values];
  schema.setCustomAttribute(VALUES_SOURCE_ATTRIBUTE, {
    kind: "static",
    values: [...values],
  });
  return schema;
}

export function createFetchValuesSourceSchema(
  url: string,
  options: Omit<FetchValuesSource, "kind" | "url"> = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): StringSchema {
  const schema = new StringSchemaClass(registry);
  schema.title = "Selection (API)";
  schema.description = "Value loaded from an external endpoint.";
  schema.setCustomAttribute(VALUES_SOURCE_ATTRIBUTE, {
    kind: "fetch",
    url,
    ...options,
  });
  return schema;
}
