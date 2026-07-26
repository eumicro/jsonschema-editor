<script setup lang="ts">
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import type { Label } from "@jsonschema-editor/ui-schema";
import { useUiElementDisplayLabel } from "../../../composables/useUiElementDisplayLabel";

const props = defineProps<{
  element: Label;
  schema: SchemaNode;
  readonly?: boolean;
}>();

defineModel<Record<string, unknown>>({ required: true });

const displayText = useUiElementDisplayLabel(
  () => props.element.i18n,
  () => props.element.text,
  "text",
);
</script>

<template>
  <p class="jse-label">{{ displayText }}</p>
</template>
