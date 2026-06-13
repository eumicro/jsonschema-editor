import type { SchemaNode } from "@jsonschema-editor/json-schema";

/** Must match `@jsonschema-editor/json-schema-extensions` field flag names. */
export const FIELD_READ_ONLY_ATTRIBUTE = "x-read-only";
export const FIELD_HIDDEN_ATTRIBUTE = "x-hidden";

export function isSchemaFieldReadOnly(
  node: SchemaNode | undefined,
  formReadonly = false,
): boolean {
  if (formReadonly) return true;
  return node?.getCustomAttribute<boolean>(FIELD_READ_ONLY_ATTRIBUTE) === true;
}

export function isSchemaFieldHidden(node: SchemaNode | undefined): boolean {
  return node?.getCustomAttribute<boolean>(FIELD_HIDDEN_ATTRIBUTE) === true;
}
