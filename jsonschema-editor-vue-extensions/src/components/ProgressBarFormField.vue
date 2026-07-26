<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  normalizeProgressBarConfig,
  progressBarFillColor,
  progressBarRatio,
  readProgressBarConfig,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
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

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

const config = computed(() => {
  const node = resolvedSchema.value ?? new NumberSchema();
  return normalizeProgressBarConfig(node, readProgressBarConfig(node));
});

const numericValue = computed(() => {
  const raw = value.value;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  return config.value.min;
});

const fillColor = computed(() => progressBarFillColor(numericValue.value, config.value));

const progressPct = computed(
  () => `${progressBarRatio(numericValue.value, config.value.min, config.value.max) * 100}%`,
);

const rangeStyle = computed(() => ({
  color: fillColor.value,
  accentColor: fillColor.value,
  "--jse-progress-thumb": fillColor.value,
  "--jse-progress-pct": progressPct.value,
}));

function onRangeInput(event: Event): void {
  if (props.readonly) return;
  const next = Number((event.target as HTMLInputElement).value);
  value.value = Number.isFinite(next) ? next : config.value.min;
}
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <div class="jse-progress-bar">
      <div class="jse-progress-bar__controls">
        <input
          class="jse-progress-bar__range"
          type="range"
          :min="config.min"
          :max="config.max"
          :step="config.step"
          :value="numericValue"
          :disabled="readonly"
          :aria-valuemin="config.min"
          :aria-valuemax="config.max"
          :aria-valuenow="numericValue"
          :aria-label="displayLabel"
          :style="rangeStyle"
          @input="onRangeInput"
        />
        <output class="jse-progress-bar__value" :style="{ color: fillColor }">
          {{ numericValue.toFixed(1) }}
        </output>
      </div>
    </div>
  </JseSchemaFormField>
</template>
