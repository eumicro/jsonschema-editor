<script setup lang="ts">
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { Control } from "@jsonschema-editor/ui-schema";
import SchemaFormFieldResolver from "../form/SchemaFormFieldResolver.vue";

defineProps<{
  element: Control;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
</script>

<template>
  <SchemaFormFieldResolver
    v-if="element.elementKind === 'Control' && element.scope"
    v-model="data"
    :schema="schema"
    :document="document"
    :scope="element.scope"
    :label="element.label"
    :i18n-key="element.i18n"
    :readonly="readonly"
  />
</template>
