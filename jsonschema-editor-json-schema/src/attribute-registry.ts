import type { AttributeDefinition, JsonSchemaObject } from "./types.js";

const RESERVED_KEYS = new Set([
  "$schema",
  "$id",
  "$ref",
  "title",
  "description",
  "type",
  "enum",
  "const",
  "default",
  "examples",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "prefixItems",
  "minItems",
  "maxItems",
  "minLength",
  "maxLength",
  "minimum",
  "maximum",
  "pattern",
  "format",
  "allOf",
  "anyOf",
  "oneOf",
  "if",
  "then",
  "else",
]);

export class JsonSchemaAttributeRegistry {
  private definitions = new Map<string, AttributeDefinition>();

  register<T>(definition: AttributeDefinition<T>): this {
    this.definitions.set(definition.name, definition as AttributeDefinition);
    return this;
  }

  unregister(name: string): boolean {
    return this.definitions.delete(name);
  }

  get(name: string): AttributeDefinition | undefined {
    return this.definitions.get(name);
  }

  list(): AttributeDefinition[] {
    return [...this.definitions.values()];
  }

  listFieldScoped(): AttributeDefinition[] {
    return this.list().filter((definition) => definition.scope === "field");
  }

  isRegistered(name: string): boolean {
    return this.definitions.has(name);
  }

  isReservedKey(key: string): boolean {
    return RESERVED_KEYS.has(key);
  }

  readCustomAttributes(json: JsonSchemaObject): Map<string, unknown> {
    const result = new Map<string, unknown>();

    for (const [key, raw] of Object.entries(json)) {
      if (this.isReservedKey(key)) continue;

      const definition = this.definitions.get(key);
      if (!definition) continue;

      const value = definition.deserialize
        ? definition.deserialize(raw)
        : raw ?? definition.defaultValue;

      if (value !== undefined) {
        result.set(key, value);
      }
    }

    return result;
  }

  writeCustomAttributes(json: JsonSchemaObject, values: Map<string, unknown>): void {
    for (const [name, value] of values) {
      const definition = this.definitions.get(name);
      if (!definition) continue;
      json[name] = definition.serialize ? definition.serialize(value) : value;
    }
  }
}

export const globalJsonSchemaAttributeRegistry = new JsonSchemaAttributeRegistry();
