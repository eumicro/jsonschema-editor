<script setup lang="ts">
import { ref, watch } from "vue";
import { cloneJsonCompatible } from "@jsonschema-editor/json-schema";
import {
  isRelationExtensionConfig,
  normalizeRelationConfig,
  type RelationExtensionConfig,
  type RelationTargetAllow,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, useJseI18n } from "@jsonschema-editor/vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const modelValue = defineModel<unknown>();
const { t } = useJseI18n();

function readConfig(value: unknown): RelationExtensionConfig {
  return isRelationExtensionConfig(value) ? value : { targets: [] };
}

const draft = ref<RelationExtensionConfig>(readConfig(modelValue.value));

watch(
  modelValue,
  (value) => {
    draft.value = readConfig(value);
  },
  { immediate: true },
);

function commit(): void {
  modelValue.value = cloneJsonCompatible(normalizeRelationConfig(draft.value));
}

function updateTarget(index: number, patch: Partial<RelationTargetAllow>): void {
  const targets = draft.value.targets.map((target, i) =>
    i === index ? { ...target, ...patch } : target,
  );
  draft.value = { ...draft.value, targets };
  commit();
}

function setSchemaIds(index: number, text: string): void {
  const schemaIds = text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  updateTarget(index, { schemaIds: schemaIds.length > 0 ? schemaIds : ["*"] });
}

function addTarget(): void {
  draft.value = {
    ...draft.value,
    targets: [...draft.value.targets, { contextId: "", schemaIds: ["*"] }],
  };
  commit();
}

function removeTarget(index: number): void {
  draft.value = {
    ...draft.value,
    targets: draft.value.targets.filter((_, i) => i !== index),
  };
  commit();
}
</script>

<template>
  <div class="jse-relation-attr">
    <div
      v-for="(target, index) in draft.targets"
      :key="index"
      class="jse-relation-attr__target"
    >
      <label class="jse-relation-attr__field">
        <span class="jse-relation-attr__label">{{ t("schemaAttributes.x-relation.contextId") }}</span>
        <JseInput
          :model-value="target.contextId"
          :readonly="readonly"
          @update:model-value="updateTarget(index, { contextId: String($event ?? '') })"
        />
      </label>
      <label class="jse-relation-attr__field">
        <span class="jse-relation-attr__label">{{ t("schemaAttributes.x-relation.schemaIds") }}</span>
        <JseInput
          :model-value="target.schemaIds.join(', ')"
          :readonly="readonly"
          placeholder="*, schema-id"
          @update:model-value="setSchemaIds(index, String($event ?? ''))"
        />
      </label>
      <button
        v-if="!readonly"
        type="button"
        class="jse-relation-attr__remove"
        @click="removeTarget(index)"
      >
        {{ t("schemaAttributes.x-relation.removeTarget") }}
      </button>
    </div>
    <button
      v-if="!readonly"
      type="button"
      class="jse-relation-attr__add"
      @click="addTarget"
    >
      {{ t("schemaAttributes.x-relation.addTarget") }}
    </button>
  </div>
</template>

<style scoped>
.jse-relation-attr {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.jse-relation-attr__target {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--jse-border, #e5e7eb);
}
.jse-relation-attr__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.jse-relation-attr__label {
  font-size: 0.8rem;
  opacity: 0.8;
}
.jse-relation-attr__add,
.jse-relation-attr__remove {
  align-self: flex-start;
  cursor: pointer;
}
</style>
