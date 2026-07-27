<script setup lang="ts">
import { computed } from "vue";
import { isSwitchExtensionConfig } from "@jsonschema-editor/json-schema-extensions";
import { JseCheckbox, useJseI18n } from "@jsonschema-editor/vue";

defineProps<{
  label: string;
  readonly?: boolean;
}>();

const { t } = useJseI18n();
const modelValue = defineModel<unknown>();

const enabled = computed(() => isSwitchExtensionConfig(modelValue.value));

function setEnabled(next: boolean): void {
  modelValue.value = next ? true : undefined;
}
</script>

<template>
  <div class="jse-switch-attr">
    <label class="jse-switch-attr__label">{{ label }}</label>
    <p class="jse-switch-attr__hint">{{ t("schemaAttributes.x-switch.hint") }}</p>
    <label class="jse-switch-attr__enable">
      <JseCheckbox
        :model-value="enabled"
        :disabled="readonly"
        @update:model-value="setEnabled"
      />
      <span>{{ t("schemaAttributes.extensionEnabled") }}</span>
    </label>
  </div>
</template>

<style scoped>
.jse-switch-attr {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.jse-switch-attr__label {
  font-weight: 600;
  font-size: 0.9rem;
}

.jse-switch-attr__hint {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.4;
}

.jse-switch-attr__enable {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}
</style>
