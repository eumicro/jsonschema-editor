import type { SchemaDocument } from "@jsonschema-editor/json-schema";

export interface AttributeControlProps {
  label: string;
  readonly?: boolean;
  modelValue?: unknown;
  onModelValueChange?: (value: unknown) => void;
  /** Root schema document (e.g. CEL `data…` field autocomplete). */
  document?: SchemaDocument;
}
