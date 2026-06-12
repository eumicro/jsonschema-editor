<script setup lang="ts">
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { HorizontalLayout, VerticalLayout } from "@jsonschema-editor/ui-schema";
import UiFormElementResolver from "./UiFormElementResolver.vue";

defineProps<{
  element: VerticalLayout | HorizontalLayout;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
</script>

<template>
  <div
    :class="
      element.elementKind === 'HorizontalLayout'
        ? 'jse-layout jse-layout--horizontal'
        : 'jse-layout'
    "
  >
    <UiFormElementResolver
      v-for="(child, index) in element.elements"
      :key="index"
      v-model="data"
      :element="child"
      :schema="schema"
      :document="document"
      :readonly="readonly"
    />
  </div>
</template>
