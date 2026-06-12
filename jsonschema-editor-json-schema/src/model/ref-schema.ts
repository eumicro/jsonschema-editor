import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { LeafSchema } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import type { SchemaVisitor } from "./visitor.js";

export class RefSchema extends LeafSchema {
  readonly nodeKind = "ref" as const;

  constructor(
    private _ref: string,
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  get ref(): string {
    return this._ref;
  }

  set ref(value: string) {
    this._ref = value;
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): RefSchema {
    const node = new RefSchema(json.$ref!, factory.attributeRegistry);
    node.applyMetadata(json);
    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitRef(this);
  }

  deepClone(): RefSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new RefSchema(this._ref, undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    return copy;
  }

  createDefaultValue(): unknown {
    return null;
  }

  protected writeTypeDefinition(json: JsonSchemaObject): void {
    json.$ref = this._ref;
  }
}
