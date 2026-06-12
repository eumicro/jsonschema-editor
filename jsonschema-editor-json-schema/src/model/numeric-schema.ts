import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { LeafSchema } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import type { SchemaVisitor } from "./visitor.js";

export abstract class NumericSchema extends LeafSchema {
  protected _minimum?: number;
  protected _maximum?: number;

  protected constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  get minimum(): number | undefined {
    return this._minimum;
  }

  set minimum(value: number | undefined) {
    this._minimum = value;
  }

  get maximum(): number | undefined {
    return this._maximum;
  }

  set maximum(value: number | undefined) {
    this._maximum = value;
  }

  protected applyNumericConstraints(json: JsonSchemaObject): void {
    this._minimum = json.minimum;
    this._maximum = json.maximum;
  }

  protected writeNumericConstraints(json: JsonSchemaObject): void {
    if (this._minimum !== undefined) json.minimum = this._minimum;
    if (this._maximum !== undefined) json.maximum = this._maximum;
  }
}

export class NumberSchema extends NumericSchema {
  readonly nodeKind = "number" as const;

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(registry, metadata, customAttributes);
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): NumberSchema {
    const node = new NumberSchema(factory.attributeRegistry);
    node.applyMetadata(json);
    node.applyTypeFrom(json);
    node.applyNumericConstraints(json);
    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitNumber(this);
  }

  deepClone(): NumberSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new NumberSchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    copy._minimum = this._minimum;
    copy._maximum = this._maximum;
    return copy;
  }

  createDefaultValue(): number {
    return 0;
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    this.writeTypeTo(json, "number");
    this.writeNumericConstraints(json);
  }
}

export class IntegerSchema extends NumericSchema {
  readonly nodeKind = "integer" as const;

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(registry, metadata, customAttributes);
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): IntegerSchema {
    const node = new IntegerSchema(factory.attributeRegistry);
    node.applyMetadata(json);
    node.applyTypeFrom(json);
    node.applyNumericConstraints(json);
    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitInteger(this);
  }

  deepClone(): IntegerSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new IntegerSchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    copy._minimum = this._minimum;
    copy._maximum = this._maximum;
    return copy;
  }

  createDefaultValue(): number {
    return 0;
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    this.writeTypeTo(json, "integer");
    this.writeNumericConstraints(json);
  }
}
