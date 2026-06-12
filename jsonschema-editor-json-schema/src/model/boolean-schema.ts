import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { LeafSchema } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import type { SchemaVisitor } from "./visitor.js";

export class BooleanSchema extends LeafSchema {
  readonly nodeKind = "boolean" as const;

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): BooleanSchema {
    const node = new BooleanSchema(factory.attributeRegistry);
    node.applyMetadata(json);
    node.applyTypeFrom(json);
    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitBoolean(this);
  }

  deepClone(): BooleanSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new BooleanSchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    return copy;
  }

  createDefaultValue(): boolean {
    return false;
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    this.writeTypeTo(json, "boolean");
  }
}
