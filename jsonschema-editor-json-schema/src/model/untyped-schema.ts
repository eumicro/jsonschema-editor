import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject } from "../types.js";
import { CustomAttributeCollection } from "./custom-attributes.js";
import type { SchemaFactory } from "./factory.js";
import { LeafSchema } from "./node.js";
import { SchemaMetadata } from "./metadata.js";
import type { SchemaVisitor } from "./visitor.js";

/** Schema ohne expliziten `type` – validiert laut Spezifikation jede Instanz. */
export class UntypedSchema extends LeafSchema {
  readonly nodeKind = "untyped" as const;

  constructor(
    registry?: JsonSchemaAttributeRegistry,
    metadata: SchemaMetadata = new SchemaMetadata(),
    customAttributes?: CustomAttributeCollection,
  ) {
    super(metadata, customAttributes ?? new CustomAttributeCollection(registry));
  }

  static fromJSON(json: JsonSchemaObject, factory: SchemaFactory): UntypedSchema {
    const node = new UntypedSchema(factory.attributeRegistry);
    node.applyMetadata(json);
    return node;
  }

  accept<T>(visitor: SchemaVisitor<T>): T {
    return visitor.visitUntyped(this);
  }

  deepClone(): UntypedSchema {
    const { metadata, customAttributes, typeVariants } = this.cloneBase();
    const copy = new UntypedSchema(undefined, metadata, customAttributes);
    copy.typeVariants = typeVariants;
    return copy;
  }

  createDefaultValue(): unknown {
    return null;
  }

  protected writeTypeDefinition(_json: JsonSchemaObject): void {
    // Kein `type` – spezifikationskonform für untypisierte Schemas.
  }
}
