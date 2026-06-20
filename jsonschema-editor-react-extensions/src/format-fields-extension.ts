import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { StringSchema } from "@jsonschema-editor/json-schema";
import {
  createStringSchemaWithFormat,
  jsonSchemaFormatExtensions,
  PHONE_FORMAT,
  URL_FORMAT,
} from "@jsonschema-editor/json-schema-extensions";
import { matchStringFormat, type JseReactExtension } from "@jsonschema-editor/react";
import { ExtendedFormatFormField } from "./components/ExtendedFormatFormField.js";

export const formatFieldsExtension: JseReactExtension = {
  id: "jsonschema-editor-format-fields",
  formFields: [
    {
      id: "react-ext-email",
      priority: 20,
      match: matchStringFormat("email"),
      component: ExtendedFormatFormField,
    },
    {
      id: "react-ext-uri",
      priority: 20,
      match: matchStringFormat(URL_FORMAT),
      component: ExtendedFormatFormField,
    },
    {
      id: "react-ext-phone",
      priority: 20,
      match: matchStringFormat(PHONE_FORMAT),
      component: ExtendedFormatFormField,
    },
  ],
  schemaTypes: jsonSchemaFormatExtensions.map((extension) => ({
    id: extension.id,
    label: extension.id,
    create: () => createStringSchemaWithFormat(extension.id),
    match: (node: SchemaNode) =>
      node instanceof StringSchema && node.format === extension.format,
  })),
};

export { ExtendedFormatFormField };
