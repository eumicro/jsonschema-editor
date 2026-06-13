import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";

export type FormatExtensionId = "email" | "url" | "phone";

export interface JsonSchemaFormatExtension {
  readonly id: FormatExtensionId;
  /** Value for the JSON Schema `format` keyword. */
  readonly format: string;
  readonly title: string;
  readonly description: string;
  readonly pattern?: string;
  validate(value: unknown): boolean;
  toSchemaFragment(): JsonSchemaObject;
}
