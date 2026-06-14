<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  isFileExtensionConfig,
  normalizeFileConfig,
  type FileExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput } from "@jsonschema-editor/vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const modelValue = defineModel<unknown>();

function readConfig(value: unknown): FileExtensionConfig {
  return isFileExtensionConfig(value) ? value : {};
}

const draft = ref<FileExtensionConfig>(readConfig(modelValue.value));

watch(
  modelValue,
  (value) => {
    draft.value = readConfig(value);
  },
  { immediate: true },
);

const acceptText = computed({
  get: () => (draft.value.accept ?? []).join(", "),
  set: (text: string) => {
    draft.value = {
      ...draft.value,
      accept: text
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
    };
    commit();
  },
});

function commit(): void {
  modelValue.value = normalizeFileConfig(draft.value);
}

function setMultiple(multiple: boolean): void {
  draft.value = { ...draft.value, multiple };
  commit();
}
</script>

<template>
  <div class="jse-file-attr">
    <label class="jse-file-attr__row">
      <input
        type="checkbox"
        :checked="draft.multiple ?? false"
        :disabled="readonly"
        @change="setMultiple(($event.target as HTMLInputElement).checked)"
      />
      <span>Multiple files</span>
    </label>

    <label class="jse-file-attr__field">
      <span class="jse-file-attr__label">Accepted types</span>
      <JseInput
        v-model="acceptText"
        :readonly="readonly"
        placeholder="image/*, application/pdf"
      />
    </label>

    <label class="jse-file-attr__field">
      <span class="jse-file-attr__label">Max size (bytes)</span>
      <JseInput
        :model-value="draft.maxSize?.toString() ?? ''"
        :readonly="readonly"
        inputmode="numeric"
        placeholder="optional"
        @update:model-value="
          draft.maxSize = $event ? Number($event) : undefined;
          commit();
        "
      />
    </label>

    <label v-if="draft.multiple" class="jse-file-attr__field">
      <span class="jse-file-attr__label">Max files</span>
      <JseInput
        :model-value="(draft.maxFiles ?? 10).toString()"
        :readonly="readonly"
        inputmode="numeric"
        @update:model-value="
          draft.maxFiles = $event ? Number($event) : 10;
          commit();
        "
      />
    </label>
  </div>
</template>

<style scoped>
.jse-file-attr {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.jse-file-attr__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.jse-file-attr__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.jse-file-attr__label {
  font-size: 0.8rem;
  color: var(--jse-muted, #64748b);
}
</style>
