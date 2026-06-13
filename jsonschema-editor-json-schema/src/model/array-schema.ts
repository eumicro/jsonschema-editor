import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { CompositeSchema, SchemaNode } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import type { SchemaVisitor } from "./visitor.js";

export type ArrayTupleKeyword = "prefixItems" | "items";
export type ArrayItemsMode = "none" | "homogeneous" | "tuple";

export class ArraySchema extends CompositeSchema {
  readonly nodeKind = "array" as const;

  private _items?: SchemaNode;
  private _prefixItems: SchemaNode[] = [];
  private _tupleKeyword: ArrayTupleKeyword = "prefixItems";
  private _minItems?: number;
  private _maxItems?: number;

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  get items(): SchemaNode | undefined {
    return this._items;
  }

  get prefixItems(): readonly SchemaNode[] {
    return this._prefixItems;
  }

  get tupleKeyword(): ArrayTupleKeyword {
    return this._tupleKeyword;
  }

  get itemsMode(): ArrayItemsMode {
    if (this._prefixItems.length > 0) return "tuple";
    if (this._items) return "homogeneous";
    return "none";
  }

  setItems(schema: SchemaNode): this {
    this._prefixItems = [];
    this._items = schema;
    return this;
  }

  setPrefixItems(
    schemas: readonly SchemaNode[],
    keyword: ArrayTupleKeyword = "prefixItems",
  ): this {
    this._prefixItems = [...schemas];
    this._tupleKeyword = keyword;
    if (keyword === "items") {
      this._items = undefined;
    }
    return this;
  }

  clearItems(): this {
    this._items = undefined;
    this._prefixItems = [];
    return this;
  }

  getPrefixItem(index: number): SchemaNode | undefined {
    return this._prefixItems[index];
  }

  setPrefixItem(index: number, schema: SchemaNode): this {
    if (index < 0 || index >= this._prefixItems.length) {
      throw new Error(`Tuple index ${index} out of range.`);
    }
    this._prefixItems[index] = schema;
    return this;
  }

  addPrefixItem(schema: SchemaNode): this {
    this._prefixItems.push(schema);
    return this;
  }

  removePrefixItem(index: number): this {
    if (index < 0 || index >= this._prefixItems.length) {
      throw new Error(`Tuple index ${index} out of range.`);
    }
    this._prefixItems.splice(index, 1);
    return this;
  }

  get minItems(): number | undefined {
    return this._minItems;
  }

  set minItems(value: number | undefined) {
    this._minItems = value;
  }

  get maxItems(): number | undefined {
    return this._maxItems;
  }

  set maxItems(value: number | undefined) {
    this._maxItems = value;
  }

  getChildren(): readonly SchemaNode[] {
    if (this._prefixItems.length) return this._prefixItems;
    return this._items ? [this._items] : [];
  }

  /** Whether list entries can be added/removed at runtime (homogeneous `items` schema). */
  supportsDynamicItems(): boolean {
    return this.itemsMode === "homogeneous" && this._items !== undefined;
  }

  /** Schema of the list entry at `index` (tuple index or homogeneous `items`). */
  resolveItemSchema(index: number): SchemaNode | undefined {
    if (this._prefixItems.length > 0) {
      return this.getPrefixItem(index) ?? this._items;
    }
    return this._items;
  }

  /** Default JSON value for a newly appended list entry. */
  createDefaultItemValue(index = 0): unknown {
    const itemSchema = this.resolveItemSchema(index);
    if (!itemSchema) {
      throw new Error("Array has no item schema.");
    }
    if (itemSchema.defaultValue !== undefined) return itemSchema.defaultValue;
    if (itemSchema.constValue !== undefined) return itemSchema.constValue;
    return itemSchema.createDefaultValue();
  }

  canAddItem(currentLength: number): boolean {
    if (!this.supportsDynamicItems()) return false;
    return this._maxItems === undefined || currentLength < this._maxItems;
  }

  canRemoveItem(currentLength: number): boolean {
    return currentLength > (this._minItems ?? 0);
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): ArraySchema {
    const node = new ArraySchema(factory.attributeRegistry);
    node.applyMetadata(json);
    node.applyTypeFrom(json);
    node._minItems = json.minItems;
    node._maxItems = json.maxItems;

    const prefixItems = json.prefixItems as JsonSchemaObject[] | undefined;
    if (prefixItems?.length) {
      node._prefixItems = prefixItems.map((item) => factory.fromJSON(item));
      node._tupleKeyword = "prefixItems";
      if (json.items && !Array.isArray(json.items)) {
        node._items = factory.fromJSON(json.items);
      }
    } else if (Array.isArray(json.items)) {
      node._prefixItems = json.items.map((item) => factory.fromJSON(item));
      node._tupleKeyword = "items";
    } else if (json.items) {
      node._items = factory.fromJSON(json.items);
    }

    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitArray(this);
  }

  deepClone(): ArraySchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new ArraySchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    copy._items = this._items?.deepClone();
    copy._prefixItems = this._prefixItems.map((item) => item.deepClone());
    copy._tupleKeyword = this._tupleKeyword;
    copy._minItems = this._minItems;
    copy._maxItems = this._maxItems;
    return copy;
  }

  createDefaultValue(): unknown[] {
    if (!this.supportsDynamicItems()) {
      return [];
    }
    const min = this._minItems ?? 0;
    if (min <= 0) {
      return [];
    }
    return Array.from({ length: min }, (_, index) => this.createDefaultItemValue(index));
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    this.writeTypeTo(json, "array");

    if (this._prefixItems.length) {
      const tupleJson = this._prefixItems.map((item) => item.toJSON());
      if (this._tupleKeyword === "items") {
        json.items = tupleJson;
      } else {
        json.prefixItems = tupleJson;
        if (this._items) {
          json.items = this._items.toJSON();
        } else {
          delete json.items;
        }
      }
    } else if (this._items) {
      json.items = this._items.toJSON();
      delete json.prefixItems;
    } else {
      delete json.items;
      delete json.prefixItems;
    }

    if (this._minItems !== undefined) json.minItems = this._minItems;
    if (this._maxItems !== undefined) json.maxItems = this._maxItems;
  }

  protected resolvePathImpl(segments: readonly string[]): SchemaNode | undefined {
    if (segments.length === 0) return this;

    const [head, ...tail] = segments;
    if (!/^\d+$/.test(head)) return undefined;

    const index = Number(head);
    if (this._prefixItems.length > 0) {
      const item = this.getPrefixItem(index);
      if (!item) return undefined;
      return tail.length ? item.resolvePath(tail) : item;
    }

    if (this._items) {
      return tail.length ? this._items.resolvePath(tail) : this._items;
    }

    return undefined;
  }
}
