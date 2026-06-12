export * from "./types.js";
export * from "./attribute-registry.js";
export type { SchemaNode } from "./model/node.js";
export {
  SchemaMetadata,
  CustomAttributeCollection,
  PropertyCollection,
  SchemaFactory,
  defaultSchemaFactory,
  RefSchema,
  CompositionSchema,
  ObjectSchema,
  ArraySchema,
  StringSchema,
  NumberSchema,
  IntegerSchema,
  BooleanSchema,
  NullSchema,
  UntypedSchema,
  TypeVariants,
  NumericSchema,
  LeafSchema,
  CompositeSchema,
  parseScope,
  type SchemaNodeKind,
  type SchemaVisitor,
} from "./model/index.js";
export { schemaFromJSON } from "./parse.js";
export {
  SchemaDocument,
  documentFromJSON,
  ensureSchemaDocument,
  isSchemaDocument,
  buildDefRef,
  parseDefRef,
  DEFS_SEGMENT,
  type DefsKey,
} from "./document.js";

