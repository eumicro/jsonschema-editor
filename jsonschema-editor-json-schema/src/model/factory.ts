import type { JsonSchemaAttributeRegistry } from "../attribute-registry.js";
import type { JsonSchemaObject, JsonSchemaType } from "../types.js";
import { globalJsonSchemaAttributeRegistry } from "../attribute-registry.js";
import { ArraySchema } from "./array-schema.js";
import { BooleanSchema } from "./boolean-schema.js";
import { CompositionSchema } from "./composition-schema.js";
import { IntegerSchema } from "./integer-schema.js";
import { NullSchema } from "./null-schema.js";
import { NumberSchema } from "./number-schema.js";
import { ObjectSchema } from "./object-schema.js";
import { RefSchema } from "./ref-schema.js";
import { StringSchema } from "./string-schema.js";
import { UntypedSchema } from "./untyped-schema.js";
import type { SchemaNode } from "./node.js";

export class SchemaFactory {
  constructor(
    public readonly attributeRegistry: JsonSchemaAttributeRegistry = globalJsonSchemaAttributeRegistry,
  ) {}

  fromJSON(json: JsonSchemaObject): SchemaNode {
    if (json.$ref) {
      return RefSchema.fromJSON(json, this);
    }

    if (json.allOf?.length || json.anyOf?.length || json.oneOf?.length) {
      return CompositionSchema.fromJSON(json, this);
    }

    const type = resolvePrimaryType(json.type);
    switch (type) {
      case "object":
        return ObjectSchema.fromJSON(json, this);
      case "array":
        return ArraySchema.fromJSON(json, this);
      case "string":
        return StringSchema.fromJSON(json, this);
      case "number":
        return NumberSchema.fromJSON(json, this);
      case "integer":
        return IntegerSchema.fromJSON(json, this);
      case "boolean":
        return BooleanSchema.fromJSON(json, this);
      case "null":
        return NullSchema.fromJSON(json, this);
      default:
        if (json.properties) {
          return ObjectSchema.fromJSON({ ...json, type: "object" }, this);
        }
        if (json.prefixItems?.length || json.items) {
          return ArraySchema.fromJSON({ ...json, type: "array" }, this);
        }
        return UntypedSchema.fromJSON(json, this);
    }
  }

  createRef(ref: string): RefSchema {
    return new RefSchema(ref, this.attributeRegistry);
  }

  createComposition(): CompositionSchema {
    return new CompositionSchema(this.attributeRegistry);
  }

  createObject(): ObjectSchema {
    return new ObjectSchema(this.attributeRegistry);
  }

  createArray(): ArraySchema {
    return new ArraySchema(this.attributeRegistry);
  }

  createString(): StringSchema {
    return new StringSchema(this.attributeRegistry);
  }

  createNumber(): NumberSchema {
    return new NumberSchema(this.attributeRegistry);
  }

  createInteger(): IntegerSchema {
    return new IntegerSchema(this.attributeRegistry);
  }

  createBoolean(): BooleanSchema {
    return new BooleanSchema(this.attributeRegistry);
  }

  createNull(): NullSchema {
    return new NullSchema(this.attributeRegistry);
  }

  createUntyped(): UntypedSchema {
    return new UntypedSchema(this.attributeRegistry);
  }
}

export const defaultSchemaFactory = new SchemaFactory();

function resolvePrimaryType(
  type: JsonSchemaType | JsonSchemaType[] | undefined,
): JsonSchemaType | undefined {
  if (Array.isArray(type)) {
    return type.find((t) => t !== "null") ?? type[0];
  }
  return type;
}
