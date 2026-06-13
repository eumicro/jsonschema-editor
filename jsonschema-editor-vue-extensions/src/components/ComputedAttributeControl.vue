<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { isComputedExtensionConfig, type ComputedExtensionConfig } from "@jsonschema-editor/json-schema-extensions";
import { JseInput } from "@jsonschema-editor/vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

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

const canCommit = computed(() => draft.value.expression.trim().length > 0);

function commit(): void {
  if (!canCommit.value) {
    return;
  }
  modelValue.value = { expression: draft.value.expression.trim() };
}
</script>

<template>
  <div class="jse-computed-attr">
    <label class="jse-computed-attr__label">{{ label }}</label>
    <JseInput
      v-model="draft.expression"
      class="jse-computed-attr__input"
      :disabled="readonly"
      placeholder="data.positionen.map(p, double(p.betrag)).sum()"
      @change="commit"
    />
    <p class="jse-computed-attr__hint">
      CEL-Ausdruck mit Root-Binding <code>data</code> (gesamte Formulardaten).
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

.jse-computed-attr__hint {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.85;
}
</style>
