<script setup lang="ts">
import { computed } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { JseI18nOptions, JseLocale } from "../../i18n/types";
import UiElementRenderer from "../molecules/ui/UiElementRenderer.vue";
import { resolveJseI18nOptions, setupJseI18n } from "../../composables/useJseI18n";

const props = defineProps<{
  schema: SchemaDocument;
  uiSchema: UiSchema;
  readonly?: boolean;
  locale?: JseLocale;
  fallbackLocale?: JseLocale;
  messages?: JseI18nOptions["messages"];
  translate?: JseI18nOptions["translate"];
}>();

setupJseI18n(() => resolveJseI18nOptions(props));

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
