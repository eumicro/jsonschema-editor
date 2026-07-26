import type { SchemaNode } from "@jsonschema-editor/json-schema";

export const FIELD_READ_ONLY_ATTRIBUTE = "x-read-only";
export const FIELD_HIDDEN_ATTRIBUTE = "x-hidden";
export const FIELD_COMPUTED_ATTRIBUTE = "x-computed";

function isComputedSchemaField(node: SchemaNode | undefined): boolean {
  const raw = node?.getCustomAttribute(FIELD_COMPUTED_ATTRIBUTE);
  return raw !== undefined && raw !== null && typeof raw === "object";
}

export function isSchemaFieldReadOnly(
  node: SchemaNode | undefined,
  formReadonly = false,
): boolean {
  if (formReadonly) return true;
  if (node?.getCustomAttribute<boolean>(FIELD_READ_ONLY_ATTRIBUTE) === true) return true;
  // Derived instance values are not user-editable; UI still uses normal type matchers.
  if (isComputedSchemaField(node)) return true;
  return false;
}

export function isSchemaFieldHidden(node: SchemaNode | undefined): boolean {
  return node?.getCustomAttribute<boolean>(FIELD_HIDDEN_ATTRIBUTE) === true;
}
