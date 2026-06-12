import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";
import type { UiSchemaObject } from "../../types.js";

const draft = "http://json-schema.org/draft-07/schema#" as const;

export function objectSchema(
  title: string,
  properties: Record<string, JsonSchemaObject>,
  required: string[],
  defs?: Record<string, JsonSchemaObject>,
  description?: string,
): JsonSchemaObject {
  return {
    $schema: draft,
    title,
    ...(description ? { description } : {}),
    type: "object",
    required,
    properties,
    ...(defs ? { $defs: defs } : {}),
  };
}

export function refDef(name: string): JsonSchemaObject {
  return { $ref: `#/$defs/${name}` };
}

export function rootControl(label: string): UiSchemaObject {
  return {
    type: "VerticalLayout",
    elements: [{ type: "Control", scope: "#", label }],
  };
}

export function propertyControls(
  properties: string[],
  baseScope = "#",
  labels?: Record<string, string>,
): UiSchemaObject {
  return {
    type: "VerticalLayout",
    elements: properties.map((name) => ({
      type: "Control" as const,
      scope: `${baseScope}/properties/${name}`,
      label: labels?.[name] ?? name,
    })),
  };
}

export function categorization(
  categories: Array<{ label: string; scope: string; controlLabel?: string }>,
): UiSchemaObject {
  return {
    type: "Categorization",
    elements: categories.map((cat) => ({
      type: "Category" as const,
      label: cat.label,
      elements: [
        {
          type: "Control" as const,
          scope: cat.scope,
          label: cat.controlLabel ?? cat.label,
        },
      ],
    })),
  };
}
