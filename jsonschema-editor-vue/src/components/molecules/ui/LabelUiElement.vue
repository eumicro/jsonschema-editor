<script setup lang="ts">
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import type { Label } from "@jsonschema-editor/ui-schema";

defineProps<{
  element: Label;
  schema: SchemaNode;
  readonly?: boolean;
}>();

defineModel<Record<string, unknown>>({ required: true });
</script>

<template>
  <p class="jse-label">{{ element.text }}</p>
</template>
