import type { JsonSchemaAttributeRegistry, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  BooleanSchema,
  IntegerSchema,
  NumberSchema,
  StringSchema,
} from "@jsonschema-editor/json-schema";
import { defaultExtensionsRegistry } from "./registry.js";

export const COMPUTED_ATTRIBUTE = "x-computed";

export interface ComputedExtensionConfig {
  expression: string;
}

export function isComputedExtensionConfig(value: unknown): value is ComputedExtensionConfig {
  if (!value || typeof value !== "object") {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.expression === "string";
}

export function readComputedConfig(node: SchemaNode): ComputedExtensionConfig | undefined {
  const raw = node.getCustomAttribute(COMPUTED_ATTRIBUTE);
  return isComputedExtensionConfig(raw) ? raw : undefined;
}

export function createComputedStringSchema(
  expression: string,
  options: { title?: string; description?: string; enumValues?: string[] } = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): StringSchema {
  const schema = new StringSchema(registry);
  schema.title = options.title ?? "Computed value";
  schema.description = options.description ?? "Value derived from a CEL expression.";
  if (options.enumValues?.length) {
    schema.enumValues = [...options.enumValues];
  }
  schema.setCustomAttribute(COMPUTED_ATTRIBUTE, { expression });
  return schema;
}

export function createComputedNumberSchema(
  expression: string,
  options: { title?: string; description?: string } = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): NumberSchema {
  const schema = new NumberSchema(registry);
  schema.title = options.title ?? "Computed number";
  schema.description = options.description ?? "Number derived from a CEL expression.";
  schema.setCustomAttribute(COMPUTED_ATTRIBUTE, { expression });
  return schema;
}

export function createComputedIntegerSchema(
  expression: string,
  options: { title?: string; description?: string } = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): IntegerSchema {
  const schema = new IntegerSchema(registry);
  schema.title = options.title ?? "Computed integer";
  schema.description = options.description ?? "Integer derived from a CEL expression.";
  schema.setCustomAttribute(COMPUTED_ATTRIBUTE, { expression });
  return schema;
}

export function createComputedBooleanSchema(
  expression: string,
  options: { title?: string; description?: string } = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): BooleanSchema {
  const schema = new BooleanSchema(registry);
  schema.title = options.title ?? "Computed flag";
  schema.description = options.description ?? "Boolean derived from a CEL expression.";
  schema.setCustomAttribute(COMPUTED_ATTRIBUTE, { expression });
  return schema;
}
