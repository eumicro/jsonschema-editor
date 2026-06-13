<script setup lang="ts">
import SchemaFormFieldResolver from "./SchemaFormFieldResolver.vue";

defineProps<{
  schema: import("@jsonschema-editor/json-schema").SchemaNode;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
</script>

<template>
  <SchemaFormFieldResolver
    v-model="data"
    :schema="schema"
    :scope="scope"
    :label="label"
    :i18n-key="i18nKey"
    :readonly="readonly"
  />
</template>
