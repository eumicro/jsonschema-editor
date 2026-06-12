<script setup lang="ts">
import { computed } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { useUiFormTypeRegistry } from "../../../composables/useRegistries";
import ControlUiElement from "./ControlUiElement.vue";

const props = defineProps<{
  element: UiElement;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
const typeRegistry = useUiFormTypeRegistry();

const resolvedComponent = computed(
  () => typeRegistry.resolve(props.element) ?? ControlUiElement,
);
</script>

<template>
  <component
    :is="resolvedComponent"
    v-model="data"
    :element="element"
    :schema="schema"
    :document="document"
    :readonly="readonly"
  />
</template>
