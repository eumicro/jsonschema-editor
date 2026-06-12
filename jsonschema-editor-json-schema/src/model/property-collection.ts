import type { SchemaNode } from "./node.js";

export class PropertyCollection {
  private readonly properties = new Map<string, SchemaNode>();
  private readonly required = new Set<string>();

  add(name: string, schema: SchemaNode, options?: { required?: boolean }): this {
    this.properties.set(name, schema);
    if (options?.required) {
      this.required.add(name);
    }
    return this;
  }

  remove(name: string): boolean {
    this.required.delete(name);
    return this.properties.delete(name);
  }

  get(name: string): SchemaNode | undefined {
    return this.properties.get(name);
  }

  has(name: string): boolean {
    return this.properties.has(name);
  }

  setRequired(name: string, isRequired: boolean): void {
    if (!this.properties.has(name)) {
      throw new Error(`Property "${name}" does not exist.`);
    }
    if (isRequired) {
      this.required.add(name);
    } else {
      this.required.delete(name);
    }
  }

  isRequired(name: string): boolean {
    return this.required.has(name);
  }

  get requiredNames(): readonly string[] {
    return [...this.required];
  }

  get size(): number {
    return this.properties.size;
  }

  entries(): IterableIterator<[string, SchemaNode]> {
    return this.properties.entries();
  }

  [Symbol.iterator](): IterableIterator<[string, SchemaNode]> {
    return this.entries();
  }

  asMap(): ReadonlyMap<string, SchemaNode> {
    return this.properties;
  }

  clone(): PropertyCollection {
    const copy = new PropertyCollection();
    for (const [name, schema] of this.properties) {
      copy.properties.set(name, schema.deepClone());
    }
    for (const name of this.required) {
      copy.required.add(name);
    }
    return copy;
  }
}
