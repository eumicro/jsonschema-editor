<script setup lang="ts">
import { computed, toRef } from "vue";
import { registerDefaultControls } from "../../registry/register-defaults.js";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { JseI18nOptions, JseLocale } from "../../i18n/types";
import UiElementRenderer from "../molecules/ui/UiElementRenderer.vue";
import { resolveJseI18nOptions, setupJseI18n } from "../../composables/useJseI18n";
import {
  setupFormValidation,
  type FormValidationMode,
} from "../../composables/useFormValidation";
import { setupJseVueExtensions, type JseVueExtension } from "../../registry/vue-extension";

const props = withDefaults(
  defineProps<{
    schema: SchemaDocument;
    uiSchema: UiSchema;
    readonly?: boolean;
    locale?: JseLocale;
    fallbackLocale?: JseLocale;
    messages?: JseI18nOptions["messages"];
    translate?: JseI18nOptions["translate"];
    extensions?: JseVueExtension[];
    validation?: boolean;
    validationMode?: FormValidationMode;
  }>(),
  {
    validation: true,
    validationMode: "blur",
  },
);

const emit = defineEmits<{
  submit: [payload: { valid: boolean }];
  validated: [payload: { valid: boolean }];
}>();

setupJseI18n(() => resolveJseI18nOptions(props));
setupJseVueExtensions(props.extensions);
registerDefaultControls();

const data = defineModel<Record<string, unknown>>({ required: true });

const validationEnabled = computed(() => props.validation !== false);
const validation = setupFormValidation({
  schema: toRef(props, "schema"),
  data,
  enabled: validationEnabled,
  mode: computed(() => props.validationMode),
});

const rootElement = computed(() => props.uiSchema.root);

function onSubmit() {
  if (!validationEnabled.value) {
    emit("submit", { valid: true });
    return;
  }

  validation.submitted.value = true;
  const valid = validation.validateAll();
  emit("validated", { valid });
  emit("submit", { valid });
}

defineExpose({
  validate: validation.validateAll,
  isValid: validation.isValid,
});
</script>

<template>
  <form class="jse-form" novalidate @submit.prevent="onSubmit">
    <UiElementRenderer
      v-model="data"
      :element="rootElement"
      :schema="schema.root"
      :document="schema"
      :readonly="readonly"
    />
  </form>
</template>
