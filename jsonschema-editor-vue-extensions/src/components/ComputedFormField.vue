<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  BooleanSchema,
  IntegerSchema,
  NumberSchema,
} from "@jsonschema-editor/json-schema";
import {
  evaluateComputedExpression,
  readComputedConfig,
} from "@jsonschema-editor/json-schema-extensions";
import {
  useFormFieldLabel,
  useScopedField,
  JseInput,
  JseSchemaFormField,
} from "@jsonschema-editor/vue";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");
const labelRef = toRef(props, "label");
const i18nKeyRef = toRef(props, "i18nKey");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { fieldSchema, value, formData } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

const evaluationError = ref<string | null>(null);

const computedConfig = computed(() =>
  resolvedSchema.value ? readComputedConfig(resolvedSchema.value) : undefined,
);

const inputType = computed(() => {
  const node = resolvedSchema.value;
  if (node instanceof BooleanSchema) return "checkbox";
  if (node instanceof NumberSchema || node instanceof IntegerSchema) return "number";
  return "text";
});

function valuesEqual(left: unknown, right: unknown): boolean {
  return Object.is(left, right);
}

function recompute(): void {
  const config = computedConfig.value;
  if (!config) {
    evaluationError.value = null;
    return;
  }

  const result = evaluateComputedExpression(config.expression, formData.value);
  if (!result.ok) {
    evaluationError.value = result.error;
    return;
  }

  evaluationError.value = null;
  if (!valuesEqual(value.value, result.value)) {
    value.value = result.value;
  }
}

watch(formData, recompute, { deep: true, immediate: true });
watch(computedConfig, recompute, { immediate: true });

const displayValue = computed(() => {
  if (inputType.value === "checkbox") {
    return value.value === true ? "true" : value.value === false ? "false" : "";
  }
  if (value.value === null || value.value === undefined) {
    return "";
  }
  return String(value.value);
});
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <JseInput
      v-if="inputType !== 'checkbox'"
      :model-value="displayValue"
      class="jse-field__input"
      :type="inputType"
      disabled
      readonly
    />
    <label v-else class="jse-field__checkbox">
      <input type="checkbox" :checked="value === true" disabled />
      <span>{{ displayValue === "true" ? "Ja" : "Nein" }}</span>
    </label>
    <p v-if="evaluationError" class="jse-field__hint jse-field__hint--error">
      {{ evaluationError }}
    </p>
  </JseSchemaFormField>
</template>

<style scoped>
.jse-field__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
