<script setup lang="ts">
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { Step } from "@jsonschema-editor/ui-schema";
import { useUiElementDisplayLabel } from "../../../composables/useUiElementDisplayLabel";
import UiFormElementResolver from "./UiFormElementResolver.vue";

const props = defineProps<{
  element: Step;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
  scopePrefix?: string;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
const displayLabel = useUiElementDisplayLabel(
  () => props.element.i18n,
  () => props.element.label,
  "label",
);
</script>

<template>
  <section class="jse-step">
    <h3 v-if="displayLabel" class="jse-step__title">{{ displayLabel }}</h3>
    <UiFormElementResolver
      v-for="(child, index) in element.elements"
      :key="index"
      v-model="data"
      :element="child"
      :schema="schema"
      :document="document"
      :readonly="readonly"
      :scope-prefix="scopePrefix"
    />
  </section>
</template>
