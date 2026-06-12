import type { ArraySchema } from "./array-schema.js";
import type { BooleanSchema } from "./boolean-schema.js";
import type { CompositionSchema } from "./composition-schema.js";
import type { IntegerSchema } from "./integer-schema.js";
import type { NullSchema } from "./null-schema.js";
import type { NumberSchema } from "./number-schema.js";
import type { ObjectSchema } from "./object-schema.js";
import type { RefSchema } from "./ref-schema.js";
import type { StringSchema } from "./string-schema.js";
import type { UntypedSchema } from "./untyped-schema.js";

export interface SchemaVisitor<T> {
  visitRef(node: RefSchema): T;
  visitComposition(node: CompositionSchema): T;
  visitObject(node: ObjectSchema): T;
  visitArray(node: ArraySchema): T;
  visitString(node: StringSchema): T;
  visitNumber(node: NumberSchema): T;
  visitInteger(node: IntegerSchema): T;
  visitBoolean(node: BooleanSchema): T;
  visitNull(node: NullSchema): T;
  visitUntyped(node: UntypedSchema): T;
}
