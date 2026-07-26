import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { StringSchema } from "@jsonschema-editor/json-schema";
import {
  createStringSchemaWithFormat,
  DATE_TODAY_FORMAT,
  jsonSchemaFormatExtensions,
  PHONE_FORMAT,
  URL_FORMAT,
} from "@jsonschema-editor/json-schema-extensions";
import { matchStringFormat, type JseVueExtension } from "@jsonschema-editor/vue";
import DateTodayFormField from "./components/DateTodayFormField.vue";
import ExtendedFormatFormField from "./components/ExtendedFormatFormField.vue";

/** Matches `email`, `uri` (URL), `phone`, and `date-today` formats from json-schema-extensions. */
export const formatFieldsExtension: JseVueExtension = {
  id: "jsonschema-editor-format-fields",
  formFields: [
    {
      id: "vue-ext-email",
      priority: 20,
      match: matchStringFormat("email"),
      component: ExtendedFormatFormField,
    },
    {
      id: "vue-ext-uri",
      priority: 20,
      match: matchStringFormat(URL_FORMAT),
      component: ExtendedFormatFormField,
    },
    {
      id: "vue-ext-phone",
      priority: 20,
      match: matchStringFormat(PHONE_FORMAT),
      component: ExtendedFormatFormField,
    },
    {
      id: "vue-ext-date-today",
      priority: 20,
      match: matchStringFormat(DATE_TODAY_FORMAT),
      component: DateTodayFormField,
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

export { ExtendedFormatFormField, DateTodayFormField };
