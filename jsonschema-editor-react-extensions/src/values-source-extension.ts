import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { StringSchema } from "@jsonschema-editor/json-schema";
import {
  createFetchValuesSourceSchema,
  createStaticValuesSourceSchema,
  isFetchValuesSource,
  isStaticValuesSource,
  readValuesSourceConfig,
  VALUES_SOURCE_ATTRIBUTE,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseReactExtension } from "@jsonschema-editor/react";
import { ValuesSourceFormField } from "./components/ValuesSourceFormField.js";

function matchesValuesSource(node: SchemaNode, kind: "static" | "fetch"): boolean {
  const config = readValuesSourceConfig(node);
  return kind === "static" ? isStaticValuesSource(config) : isFetchValuesSource(config);
}

/** Example extension: select values from a static list or an external API endpoint. */
export const valuesSourceExtension: JseReactExtension = {
  id: "jsonschema-editor-values-source",
  formFields: [
    {
      id: "react-ext-values-source",
      priority: 25,
      match: matchCustomAttribute(VALUES_SOURCE_ATTRIBUTE),
      component: ValuesSourceFormField,
    },
  ],
  schemaTypes: [
    {
      id: "select-list",
      label: "select-list",
      create: () => createStaticValuesSourceSchema(["Option A", "Option B", "Option C"]),
      match: (node) => node instanceof StringSchema && matchesValuesSource(node, "static"),
    },
    {
      id: "select-api",
      label: "select-api",
      create: () =>
        createFetchValuesSourceSchema("https://jsonplaceholder.typicode.com/users", {
          valueField: "id",
          labelField: "name",
        }),
      match: (node) => node instanceof StringSchema && matchesValuesSource(node, "fetch"),
    },
  ],
};

export { ValuesSourceFormField };
