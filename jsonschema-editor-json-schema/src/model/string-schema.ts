import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { LeafSchema } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import type { SchemaVisitor } from "./visitor.js";

export class StringSchema extends LeafSchema {
  readonly nodeKind = "string" as const;

  private _minLength?: number;
  private _maxLength?: number;
  private _pattern?: string;
  private _format?: string;

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  get minLength(): number | undefined {
    return this._minLength;
  }

  set minLength(value: number | undefined) {
    this._minLength = value;
  }

  get maxLength(): number | undefined {
    return this._maxLength;
  }

  set maxLength(value: number | undefined) {
    this._maxLength = value;
  }

  get pattern(): string | undefined {
    return this._pattern;
  }

  set pattern(value: string | undefined) {
    this._pattern = value;
  }

  get format(): string | undefined {
    return this._format;
  }

  set format(value: string | undefined) {
    this._format = value;
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): StringSchema {
    const node = new StringSchema(factory.attributeRegistry);
    node.applyMetadata(json);
    node.applyTypeFrom(json);
    node._minLength = json.minLength;
    node._maxLength = json.maxLength;
    node._pattern = json.pattern;
    node._format = json.format;
    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitString(this);
  }

  deepClone(): StringSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new StringSchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    copy._minLength = this._minLength;
    copy._maxLength = this._maxLength;
    copy._pattern = this._pattern;
    copy._format = this._format;
    return copy;
  }

  createDefaultValue(): string {
    return "";
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    this.writeTypeTo(json, "string");
    if (this._minLength !== undefined) json.minLength = this._minLength;
    if (this._maxLength !== undefined) json.maxLength = this._maxLength;
    if (this._pattern !== undefined) json.pattern = this._pattern;
    if (this._format !== undefined) json.format = this._format;
  }
}
