<script setup lang="ts">
import { computed } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import UiElementRenderer from "../molecules/ui/UiElementRenderer.vue";

const props = defineProps<{
  schema: SchemaDocument;
  uiSchema: UiSchema;
  readonly?: boolean;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });

const rootElement = computed(() => props.uiSchema.root);
</script>

<template>
  <form class="jse-form" @submit.prevent>
    <UiElementRenderer
      v-model="data"
      :element="rootElement"
      :schema="schema.root"
      :document="schema"
      :readonly="readonly"
    />
  </form>
</template>
