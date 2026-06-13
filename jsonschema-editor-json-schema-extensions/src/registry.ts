import type {
  JsonSchemaAttributeRegistry,
  JsonSchemaObject,
  StringSchema,
} from "@jsonschema-editor/json-schema";
import {
  JsonSchemaAttributeRegistry as Registry,
  StringSchema as StringSchemaClass,
  documentFromJSON,
  schemaFromJSON,
} from "@jsonschema-editor/json-schema";
import { emailExtension, phoneExtension, urlExtension } from "./formats/index.js";
import type { FormatExtensionId, JsonSchemaFormatExtension } from "./types.js";
import { isGeometryExtensionConfig } from "./geometry.js";
import { isValuesSourceConfig } from "./values-source.js";
import { registerFieldFlagAttributes } from "./field-flags.js";

export const jsonSchemaFormatExtensions: readonly JsonSchemaFormatExtension[] = [
  emailExtension,
  urlExtension,
  phoneExtension,
];

const extensionById = new Map<FormatExtensionId, JsonSchemaFormatExtension>(
  jsonSchemaFormatExtensions.map((extension) => [extension.id, extension]),
);

const extensionByFormat = new Map<string, JsonSchemaFormatExtension>(
  jsonSchemaFormatExtensions.map((extension) => [extension.format, extension]),
);

export function getFormatExtension(id: FormatExtensionId): JsonSchemaFormatExtension {
  const extension = extensionById.get(id);
  if (!extension) {
    throw new Error(`Unknown format extension: ${id}`);
  }
  return extension;
}

export function getFormatExtensionByFormat(format: string): JsonSchemaFormatExtension | undefined {
  return extensionByFormat.get(format);
}

export function listFormatExtensionIds(): FormatExtensionId[] {
  return jsonSchemaFormatExtensions.map((extension) => extension.id);
}

export function applyFormatExtension(schema: StringSchema, id: FormatExtensionId): StringSchema {
  const extension = getFormatExtension(id);
  schema.format = extension.format;
  schema.pattern = extension.pattern;
  schema.title = extension.title;
  schema.description = extension.description;
  schema.setCustomAttribute("x-format-extension", extension.id);
  return schema;
}

export function createStringSchemaWithFormat(
  id: FormatExtensionId,
  registry?: JsonSchemaAttributeRegistry,
): StringSchema {
  return applyFormatExtension(new StringSchemaClass(registry), id);
}

export function createFormatSchemaFragment(id: FormatExtensionId): JsonSchemaObject {
  const extension = getFormatExtension(id);
  return {
    ...extension.toSchemaFragment(),
    "x-format-extension": extension.id,
  };
}

export function validateFormatValue(id: FormatExtensionId, value: unknown): boolean {
  return getFormatExtension(id).validate(value);
}

export function validateByFormatKeyword(format: string, value: unknown): boolean {
  const extension = getFormatExtensionByFormat(format);
  return extension ? extension.validate(value) : false;
}

/**
 * Registers `x-format-extension` on the given registry (or a new one) so values
 * roundtrip through `@jsonschema-editor/json-schema`.
 */
export function createExtensionsRegistry(
  base: JsonSchemaAttributeRegistry = new Registry(),
): JsonSchemaAttributeRegistry {
  if (!base.isRegistered("x-format-extension")) {
    base.register({
      name: "x-format-extension",
      defaultValue: undefined,
      deserialize: (raw) => (typeof raw === "string" ? raw : undefined),
      serialize: (value) => value,
    });
  }
  if (!base.isRegistered("x-values-source")) {
    base.register({
      name: "x-values-source",
      defaultValue: undefined,
      deserialize: (raw) => (isValuesSourceConfig(raw) ? raw : undefined),
      serialize: (value) => value,
    });
  }
  if (!base.isRegistered("x-geometry")) {
    base.register({
      name: "x-geometry",
      defaultValue: undefined,
      deserialize: (raw) => (isGeometryExtensionConfig(raw) ? raw : undefined),
      serialize: (value) => value,
    });
  }
  registerFieldFlagAttributes(base);
  return base;
}

export const defaultExtensionsRegistry = createExtensionsRegistry();

export function schemaFromJSONWithExtensions(
  json: JsonSchemaObject,
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): ReturnType<typeof schemaFromJSON> {
  return schemaFromJSON(json, registry);
}

export function documentFromJSONWithExtensions(
  json: JsonSchemaObject,
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
) {
  return documentFromJSON(json, registry);
}
