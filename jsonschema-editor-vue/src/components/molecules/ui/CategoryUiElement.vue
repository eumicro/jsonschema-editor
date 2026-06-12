<script setup lang="ts">
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { Category } from "@jsonschema-editor/ui-schema";
import UiFormElementResolver from "./UiFormElementResolver.vue";

defineProps<{
  element: Category;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
</script>

<template>
  <section class="jse-category">
    <h3 v-if="element.label" class="jse-category__title">{{ element.label }}</h3>
    <UiFormElementResolver
      v-for="(child, index) in element.elements"
      :key="index"
      v-model="data"
      :element="child"
      :schema="schema"
      :document="document"
      :readonly="readonly"
    />
  </section>
</template>
