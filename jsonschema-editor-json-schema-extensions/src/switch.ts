import type { JsonSchemaAttributeRegistry, SchemaNode } from "@jsonschema-editor/json-schema";
import { BooleanSchema } from "@jsonschema-editor/json-schema";
import { defaultExtensionsRegistry } from "./registry.js";

export const SWITCH_ATTRIBUTE = "x-switch";

/** `x-switch` is a presentation flag: `true` enables the switch control. */
export function isSwitchExtensionConfig(value: unknown): value is true {
  return value === true;
}

export function readSwitchConfig(node: SchemaNode): true | undefined {
  const raw = node.getCustomAttribute(SWITCH_ATTRIBUTE);
  return isSwitchExtensionConfig(raw) ? true : undefined;
}

export function createSwitchSchema(
  options: {
    title?: string;
    description?: string;
  } = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): BooleanSchema {
  const schema = new BooleanSchema(registry);
  schema.title = options.title ?? "Switch";
  if (options.description) schema.description = options.description;
  schema.setCustomAttribute(SWITCH_ATTRIBUTE, true);
  return schema;
}
