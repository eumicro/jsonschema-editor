import type { AppLocale, AppStack } from "../app-routing";

export type ExampleEmbedCodeInput = {
  stack: AppStack;
  exampleId: string;
  locale: AppLocale;
};

/** Stack-specific embed snippet for the Code workspace tab. */
export function exampleEmbedCode({ stack, exampleId, locale }: ExampleEmbedCodeInput): string {
  if (stack === "react") {
    return `import { useState } from "react";
import { JsonSchemaForm } from "@jsonschema-editor/react";
import { registerDefaultReactExtensions } from "@jsonschema-editor/react-extensions";
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import "@jsonschema-editor/react/style.css";

import schemaJson from "./examples/${exampleId}/schema.json";
import uiSchemaJson from "./examples/${exampleId}/ui.schema.json";
import defaults from "./examples/${exampleId}/defaults.json";

registerDefaultReactExtensions();

const schema = documentFromJSONWithExtensions(schemaJson);
const uiSchema = UiSchema.fromJSON(uiSchemaJson);

export function ExampleForm() {
  const [formData, setFormData] = useState(defaults);

  return (
    <JsonSchemaForm
      schema={schema}
      uiSchema={uiSchema}
      data={formData}
      onDataChange={setFormData}
      locale="${locale}"
    />
  );
}
`;
  }

  return `<script setup lang="ts">
import { ref } from "vue";
import { JsonSchemaForm } from "@jsonschema-editor/vue";
import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

import schemaJson from "./examples/${exampleId}/schema.json";
import uiSchemaJson from "./examples/${exampleId}/ui.schema.json";
import defaults from "./examples/${exampleId}/defaults.json";

registerDefaultVueExtensions();

const schema = documentFromJSONWithExtensions(schemaJson);
const uiSchema = UiSchema.fromJSON(uiSchemaJson);
const formData = ref(defaults);
</script>

<template>
  <JsonSchemaForm
    v-model="formData"
    :schema="schema"
    :ui-schema="uiSchema"
    locale="${locale}"
  />
</template>
`;
}
