export type JsonSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "null"
  | "object"
  | "array";

export interface JsonSchemaObject {
  $schema?: string;
  $id?: string;
  $ref?: string;
  title?: string;
  description?: string;
  type?: JsonSchemaType | JsonSchemaType[];
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  examples?: unknown[];
  properties?: Record<string, JsonSchemaObject>;
  required?: string[];
  additionalProperties?: boolean | JsonSchemaObject;
  items?: JsonSchemaObject | JsonSchemaObject[];
  prefixItems?: JsonSchemaObject[];
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
  allOf?: JsonSchemaObject[];
  anyOf?: JsonSchemaObject[];
  oneOf?: JsonSchemaObject[];
  if?: JsonSchemaObject;
  then?: JsonSchemaObject;
  else?: JsonSchemaObject;
  $defs?: Record<string, JsonSchemaObject>;
  definitions?: Record<string, JsonSchemaObject>;
  [key: string]: unknown;
}

/** `field` = shown on every schema field in the editor and storable on any property node. */
export type AttributeScope = "field";

export interface AttributeDefinition<T = unknown> {
  name: string;
  defaultValue?: T;
  /** When `"field"`, the attribute is offered for all field types (not only after it was set once). */
  scope?: AttributeScope;
  serialize?: (value: T) => unknown;
  deserialize?: (raw: unknown) => T;
}
