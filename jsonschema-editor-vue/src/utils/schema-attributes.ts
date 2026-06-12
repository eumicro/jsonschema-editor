import {
  ArraySchema,
  IntegerSchema,
  NumberSchema,
  StringSchema,
  type SchemaDocument,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";
import { updateNodeAtPath } from "./schema-document";
import type { SchemaPath } from "./schema-editor";

export interface SchemaAttributeField {
  name: string;
  label: string;
}

const COMMON_ATTRIBUTES: readonly SchemaAttributeField[] = [
  { name: "title", label: "Titel" },
  { name: "description", label: "Beschreibung" },
];

const STRING_ATTRIBUTES: readonly SchemaAttributeField[] = [
  { name: "minLength", label: "minLength" },
  { name: "maxLength", label: "maxLength" },
  { name: "pattern", label: "pattern" },
  { name: "format", label: "format" },
];

const NUMERIC_ATTRIBUTES: readonly SchemaAttributeField[] = [
  { name: "minimum", label: "minimum" },
  { name: "maximum", label: "maximum" },
];

const ARRAY_ATTRIBUTES: readonly SchemaAttributeField[] = [
  { name: "minItems", label: "minItems" },
  { name: "maxItems", label: "maxItems" },
];

export function listSchemaAttributeFields(node: SchemaNode): SchemaAttributeField[] {
  const fields: SchemaAttributeField[] = [...COMMON_ATTRIBUTES];

  if (node instanceof StringSchema) {
    fields.push(...STRING_ATTRIBUTES);
  } else if (node instanceof NumberSchema || node instanceof IntegerSchema) {
    fields.push(...NUMERIC_ATTRIBUTES);
  } else if (node instanceof ArraySchema) {
    fields.push(...ARRAY_ATTRIBUTES);
  }

  return fields;
}

export function getSchemaAttributeValue(node: SchemaNode, name: string): unknown {
  switch (name) {
    case "title":
      return node.title ?? "";
    case "description":
      return node.description ?? "";
    case "minLength":
      return node instanceof StringSchema ? (node.minLength ?? undefined) : undefined;
    case "maxLength":
      return node instanceof StringSchema ? (node.maxLength ?? undefined) : undefined;
    case "pattern":
      return node instanceof StringSchema ? (node.pattern ?? "") : "";
    case "format":
      return node instanceof StringSchema ? (node.format ?? "") : "";
    case "minimum":
      return node instanceof NumberSchema || node instanceof IntegerSchema
        ? (node.minimum ?? undefined)
        : undefined;
    case "maximum":
      return node instanceof NumberSchema || node instanceof IntegerSchema
        ? (node.maximum ?? undefined)
        : undefined;
    case "minItems":
      return node instanceof ArraySchema ? (node.minItems ?? undefined) : undefined;
    case "maxItems":
      return node instanceof ArraySchema ? (node.maxItems ?? undefined) : undefined;
    default:
      return node.getCustomAttribute(name);
  }
}

export function setSchemaAttributeValue(node: SchemaNode, name: string, value: unknown): void {
  switch (name) {
    case "title":
      node.title = typeof value === "string" && value ? value : undefined;
      return;
    case "description":
      node.description = typeof value === "string" && value ? value : undefined;
      return;
    case "minLength":
      if (node instanceof StringSchema) {
        node.minLength = value === undefined || value === "" ? undefined : Number(value);
      }
      return;
    case "maxLength":
      if (node instanceof StringSchema) {
        node.maxLength = value === undefined || value === "" ? undefined : Number(value);
      }
      return;
    case "pattern":
      if (node instanceof StringSchema) {
        node.pattern = typeof value === "string" && value ? value : undefined;
      }
      return;
    case "format":
      if (node instanceof StringSchema) {
        node.format = typeof value === "string" && value ? value : undefined;
      }
      return;
    case "minimum":
      if (node instanceof NumberSchema || node instanceof IntegerSchema) {
        node.minimum = value === undefined || value === "" ? undefined : Number(value);
      }
      return;
    case "maximum":
      if (node instanceof NumberSchema || node instanceof IntegerSchema) {
        node.maximum = value === undefined || value === "" ? undefined : Number(value);
      }
      return;
    case "minItems":
      if (node instanceof ArraySchema) {
        node.minItems = value === undefined || value === "" ? undefined : Number(value);
      }
      return;
    case "maxItems":
      if (node instanceof ArraySchema) {
        node.maxItems = value === undefined || value === "" ? undefined : Number(value);
      }
      return;
    default:
      node.setCustomAttribute(name, value);
  }
}

export function patchSchemaAttribute(
  document: SchemaDocument,
  path: SchemaPath,
  name: string,
  value: unknown,
): SchemaDocument {
  return updateNodeAtPath(document, path, (node) => {
    setSchemaAttributeValue(node, name, value);
  });
}
