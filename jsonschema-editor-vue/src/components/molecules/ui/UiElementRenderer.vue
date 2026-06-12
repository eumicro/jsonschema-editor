<script setup lang="ts">
defineOptions({ name: "UiElementRenderer" });

import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import UiFormElementResolver from "./UiFormElementResolver.vue";

defineProps<{
  element: UiElement;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
</script>

<template>
  <UiFormElementResolver
    v-model="data"
    :element="element"
    :schema="schema"
    :document="document"
    :readonly="readonly"
  />
</template>
