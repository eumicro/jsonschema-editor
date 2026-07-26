<script setup lang="ts">
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { Group } from "@jsonschema-editor/ui-schema";
import { useUiElementDisplayLabel } from "../../../composables/useUiElementDisplayLabel";
import UiFormElementResolver from "./UiFormElementResolver.vue";

const props = defineProps<{
  element: Group;
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
  <fieldset class="jse-group">
    <legend v-if="displayLabel">{{ displayLabel }}</legend>
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
  </fieldset>
</template>
