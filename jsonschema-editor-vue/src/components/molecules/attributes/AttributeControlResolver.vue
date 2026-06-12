<script setup lang="ts">
import { computed } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  useSchemaAttributeControlRegistry,
  useUiAttributeControlRegistry,
} from "../../../composables/useRegistries";
import StringAttributeControl from "./StringAttributeControl.vue";

const props = defineProps<{
  node: SchemaNode | UiElement;
  attributeName: string;
  label: string;
  readonly?: boolean;
  mode: "schema" | "ui";
}>();

const modelValue = defineModel<unknown>();
const schemaRegistry = useSchemaAttributeControlRegistry();
const uiRegistry = useUiAttributeControlRegistry();

const resolvedComponent = computed(() => {
  const context = {
    node: props.node,
    attributeName: props.attributeName,
    label: props.label,
    value: modelValue.value,
    readonly: props.readonly,
  };

  if (props.mode === "schema") {
    return schemaRegistry.resolve(context as never) ?? StringAttributeControl;
  }

  return uiRegistry.resolve(context as never) ?? StringAttributeControl;
});
</script>

<template>
  <component
    :is="resolvedComponent"
    v-model="modelValue"
    :label="label"
    :readonly="readonly"
  />
</template>
