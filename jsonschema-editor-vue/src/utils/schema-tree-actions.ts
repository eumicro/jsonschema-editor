import type { SchemaNode } from "@jsonschema-editor/json-schema";
import {
  ArraySchema,
  CompositionSchema,
  ObjectSchema,
} from "@jsonschema-editor/json-schema";
import type { SchemaPath } from "./schema-editor.js";

export function canAcceptSchemaChildren(node: SchemaNode): boolean {
  return (
    node instanceof ObjectSchema ||
    node instanceof CompositionSchema ||
    node instanceof ArraySchema
  );
}

export function canDeleteSchemaNode(path: SchemaPath): boolean {
  return path.length > 0;
}
