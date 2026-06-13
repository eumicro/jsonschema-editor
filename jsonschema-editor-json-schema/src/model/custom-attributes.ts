import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import { globalJsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";

export class CustomAttributeCollection {
  private readonly values = new Map<string, unknown>();

  constructor(
    private readonly registry: JsonSchemaAttributeRegistry = globalJsonSchemaAttributeRegistry,
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

  has(name: string): boolean {
    return this.values.has(name);
  }

  entries(): IterableIterator<[string, unknown]> {
    return this.values.entries();
  }

  listNames(): string[] {
    return [...this.values.keys()];
  }

  applyFrom(json: JsonSchemaObject): void {
    this.values.clear();
    for (const [key, value] of this.registry.readCustomAttributes(json)) {
      this.values.set(key, value);
    }
  }

  writeTo(json: JsonSchemaObject): void {
    this.registry.writeCustomAttributes(json, this.values);
  }

  clone(registry: JsonSchemaAttributeRegistry = this.registry): CustomAttributeCollection {
    const copy = new CustomAttributeCollection(registry);
    for (const [key, value] of this.values) {
      copy.values.set(key, structuredClone(value));
    }
    return copy;
  }
}
