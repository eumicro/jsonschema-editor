import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import { globalUiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";

export class UiCustomAttributeCollection {
  private readonly values = new Map<string, unknown>();

  constructor(
    private readonly registry: UiSchemaAttributeRegistry = globalUiSchemaAttributeRegistry,
  ) {}

  get(name: string): unknown {
    return this.values.get(name);
  }

  set(name: string, value: unknown): this {
    this.values.set(name, value);
    return this;
  }

  delete(name: string): boolean {
    return this.values.delete(name);
  }

  applyFrom(json: UiSchemaObject): void {
    this.values.clear();
    for (const [key, value] of this.registry.readCustomAttributes(json)) {
      this.values.set(key, value);
    }
  }

  writeTo(json: UiSchemaObject): void {
    this.registry.writeCustomAttributes(json, this.values);
  }

  clone(registry: UiSchemaAttributeRegistry = this.registry): UiCustomAttributeCollection {
    const copy = new UiCustomAttributeCollection(registry);
    for (const [key, value] of this.values) {
      copy.values.set(key, structuredClone(value));
    }
    return copy;
  }
}
