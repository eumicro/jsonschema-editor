<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  normalizeRatingConfig,
  ratingFillColor,
  ratingLevels,
  readRatingConfig,
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
  return normalizeRatingConfig(node, readRatingConfig(node));
});

const levels = computed(() => ratingLevels(config.value));

const numericValue = computed(() => {
  const raw = value.value;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  return config.value.min;
});

const fillColor = computed(() => ratingFillColor(numericValue.value, config.value));

const rootStyle = computed(() => ({
  "--jse-rating-fill": fillColor.value,
}));

function isActive(level: number): boolean {
  return numericValue.value + 1e-9 >= level;
}

function selectLevel(level: number): void {
  if (props.readonly) return;
  if (Math.abs(numericValue.value - level) < 1e-9 && config.value.min === 0) {
    value.value = 0;
    return;
  }
  value.value = level;
}
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <div class="jse-rating" :style="rootStyle">
      <div class="jse-rating__symbols" role="radiogroup" :aria-label="displayLabel">
        <button
          v-for="level in levels"
          :key="level"
          type="button"
          class="jse-rating__symbol"
          :class="{ 'jse-rating__symbol--active': isActive(level) }"
          :style="isActive(level) ? { color: fillColor } : undefined"
          role="radio"
          :aria-checked="Math.abs(numericValue - level) < 1e-9"
          :aria-label="`${level}`"
          :disabled="readonly"
          @click="selectLevel(level)"
        >
          {{ config.character }}
        </button>
      </div>
      <output class="jse-rating__value">{{ numericValue.toFixed(config.step < 1 ? 1 : 0) }}</output>
    </div>
  </JseSchemaFormField>
</template>
