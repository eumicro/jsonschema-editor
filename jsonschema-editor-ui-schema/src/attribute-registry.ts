import type { UiAttributeDefinition, UiSchemaObject } from "./types.js";

const RESERVED_KEYS = new Set([
  "type",
  "scope",
  "label",
  "text",
  "i18n",
  "elements",
  "options",
  "rule",
]);

export class UiSchemaAttributeRegistry {
  private definitions = new Map<string, UiAttributeDefinition>();

  register<T>(definition: UiAttributeDefinition<T>): this {
    this.definitions.set(definition.name, definition as UiAttributeDefinition);
    return this;
  }

  unregister(name: string): boolean {
    return this.definitions.delete(name);
  }

  get(name: string): UiAttributeDefinition | undefined {
    return this.definitions.get(name);
  }

  list(): UiAttributeDefinition[] {
    return [...this.definitions.values()];
  }

  isReservedKey(key: string): boolean {
    return RESERVED_KEYS.has(key);
  }

  readCustomAttributes(json: UiSchemaObject): Map<string, unknown> {
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

  writeCustomAttributes(json: UiSchemaObject, values: Map<string, unknown>): void {
    for (const [name, value] of values) {
      const definition = this.definitions.get(name);
      if (!definition) continue;
      json[name] = definition.serialize ? definition.serialize(value) : value;
    }
  }
}

export const globalUiSchemaAttributeRegistry = new UiSchemaAttributeRegistry();
