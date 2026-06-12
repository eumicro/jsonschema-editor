/** Typen für Array-Items: Primitiv bis verschachtelt. */
export const PRIMITIVE_SCHEMA_KINDS = [
  "string",
  "number",
  "integer",
  "boolean",
  "null",
] as const;

/** JSON-Schema-`string` mit `format` (kein eigener `type`-Wert). */
export const STRING_FORMAT_SCHEMA_KINDS = ["date", "date-time"] as const;

export const FORMAT_BY_STRING_KIND: Record<(typeof STRING_FORMAT_SCHEMA_KINDS)[number], string> = {
  date: "date",
  "date-time": "date-time",
};

export const COMPOSITE_SCHEMA_KINDS = ["object", "array"] as const;

export const ARRAY_ITEM_TYPE_KINDS = [
  ...PRIMITIVE_SCHEMA_KINDS,
  ...STRING_FORMAT_SCHEMA_KINDS,
  ...COMPOSITE_SCHEMA_KINDS,
] as const;

export const OBJECT_PROPERTY_KINDS = [...ARRAY_ITEM_TYPE_KINDS] as const;

/** Gültige JSON-Schema-`type`-Werte zum Umwandeln eines Feldes (kein allOf/oneOf/anyOf). */
export const SCHEMA_CHANGE_KINDS = [...ARRAY_ITEM_TYPE_KINDS] as const;

export type StringFormatSchemaKind = (typeof STRING_FORMAT_SCHEMA_KINDS)[number];
export type ArrayItemTypeKind = (typeof ARRAY_ITEM_TYPE_KINDS)[number];
export type SchemaChangeKind = (typeof SCHEMA_CHANGE_KINDS)[number];

export function isStringFormatKind(kind: string): kind is StringFormatSchemaKind {
  return (STRING_FORMAT_SCHEMA_KINDS as readonly string[]).includes(kind);
}

export function formatToSchemaKind(format: string | undefined): StringFormatSchemaKind | null {
  if (format === "date") return "date";
  if (format === "date-time") return "date-time";
  return null;
}

export function isArrayItemTypeKind(kind: string): kind is ArrayItemTypeKind {
  return (ARRAY_ITEM_TYPE_KINDS as readonly string[]).includes(kind);
}
