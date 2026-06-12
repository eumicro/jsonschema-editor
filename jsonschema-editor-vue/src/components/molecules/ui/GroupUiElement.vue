<script setup lang="ts">
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { Group } from "@jsonschema-editor/ui-schema";
import UiFormElementResolver from "./UiFormElementResolver.vue";

defineProps<{
  element: Group;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
</script>

<template>
  <fieldset class="jse-group">
    <legend v-if="element.label">{{ element.label }}</legend>
    <UiFormElementResolver
      v-for="(child, index) in element.elements"
      :key="index"
      v-model="data"
      :element="child"
      :schema="schema"
      :document="document"
      :readonly="readonly"
    />
  </fieldset>
</template>
