<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { isComputedExtensionConfig, type ComputedExtensionConfig } from "@jsonschema-editor/json-schema-extensions";
import { useJseI18n } from "@jsonschema-editor/vue";
import CelExpressionEditor from "./CelExpressionEditor.vue";

defineProps<{
  label: string;
  readonly?: boolean;
  document?: SchemaDocument;
}>();

const { t } = useJseI18n();
const modelValue = defineModel<unknown>();

function readConfig(value: unknown): ComputedExtensionConfig {
  if (isComputedExtensionConfig(value)) {
    return { expression: value.expression };
  }
  return { expression: "" };
}

const draft = ref(readConfig(modelValue.value));

watch(
  modelValue,
  (value) => {
    draft.value = readConfig(value);
  },
  { immediate: true },
);

const enabled = computed(
  () => modelValue.value !== undefined && modelValue.value !== null,
);

const canCommit = computed(() => draft.value.expression.trim().length > 0);

function setEnabled(next: boolean): void {
  if (!next) {
    modelValue.value = undefined;
    return;
  }
  if (canCommit.value) {
    modelValue.value = { expression: draft.value.expression.trim() };
  } else {
    modelValue.value = { expression: "" };
  }
}

function commit(): void {
  if (!enabled.value) return;
  if (!canCommit.value) {
    modelValue.value = { expression: "" };
    return;
  }
  modelValue.value = { expression: draft.value.expression.trim() };
}

function onExpressionChange(expression: string): void {
  draft.value = { expression };
}
</script>

<template>
  <div class="jse-computed-attr">
    <label class="jse-computed-attr__label">{{ label }}</label>
    <label class="jse-computed-attr__enable">
      <input
        type="checkbox"
        :checked="enabled"
        :disabled="readonly"
        @change="setEnabled(($event.target as HTMLInputElement).checked)"
      />
      <span>{{ t("schemaAttributes.extensionEnabled") }}</span>
    </label>
    <CelExpressionEditor
      class="jse-computed-attr__editor"
      :model-value="draft.expression"
      :disabled="readonly || !enabled"
      :document="document"
      placeholder="data.positionen.map(p, double(p.betrag)).sum()"
      @update:model-value="onExpressionChange"
      @blur="commit"
    />
    <p class="jse-computed-attr__hint">
      {{ t("schemaAttributes.x-computed.hint") }}
    </p>
  </div>
</template>

<style scoped>
.jse-computed-attr {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.jse-computed-attr__label {
  font-weight: 600;
}

.jse-computed-attr__enable {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.jse-computed-attr__hint {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.85;
}
</style>
