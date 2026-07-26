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

/** JSON Schema kinds for which an extension attribute can be offered in the editor. */
export type AttributeOfferKind = "string" | "number" | "integer" | "boolean";

/**
 * How extension attributes compose in the schema editor.
 * `behavior` (e.g. `x-computed`) may stand alone; `presentation` (e.g. progress/rating)
 * may optionally combine with listed behavior attributes.
 */
export type AttributeCompositionRole = "behavior" | "presentation";

export interface AttributeComposition {
  role: AttributeCompositionRole;
  /** Other attribute names this one may combine with (e.g. presentation + `x-computed`). */
  combinesWith?: readonly string[];
  /** Mutually exclusive peer attributes (e.g. `x-progress-bar` vs `x-rating`). */
  exclusiveWith?: readonly string[];
}

export interface AttributeDefinition<T = unknown> {
  name: string;
  defaultValue?: T;
  /** When `"field"`, the attribute is offered for all field types (not only after it was set once). */
  scope?: AttributeScope;
  /**
   * Always offer this attribute in the schema editor for these kinds,
   * even when it is not yet set on the node.
   */
  offerForKinds?: readonly AttributeOfferKind[];
  /** Optional composition / dependency rules for the schema editor. */
  composition?: AttributeComposition;
  serialize?: (value: T) => unknown;
  deserialize?: (raw: unknown) => T;
}
