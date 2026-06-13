<script setup lang="ts">
import { useJseI18n } from "../../../composables/useJseI18n";
import {
  FIELD_HIDDEN_ATTRIBUTE,
  FIELD_READ_ONLY_ATTRIBUTE,
} from "../../../utils/field-behavior";

const emit = defineEmits<{
  apply: [attributeName: string, value: boolean];
}>();

const { t } = useJseI18n();
</script>

<template>
  <fieldset class="jse-field-bulk-actions">
    <legend>{{ t("schemaAttributes.bulkFieldExtensions") }}</legend>
    <p class="jse-field-bulk-actions__hint">{{ t("schemaAttributes.bulkFieldExtensionsHint") }}</p>
    <div class="jse-field-bulk-actions__buttons">
      <button
        type="button"
        class="jse-field-bulk-actions__btn"
        @click="emit('apply', FIELD_READ_ONLY_ATTRIBUTE, true)"
      >
        {{ t("schemaAttributes.bulkSetReadOnly") }}
      </button>
      <button
        type="button"
        class="jse-field-bulk-actions__btn"
        @click="emit('apply', FIELD_READ_ONLY_ATTRIBUTE, false)"
      >
        {{ t("schemaAttributes.bulkClearReadOnly") }}
      </button>
      <button
        type="button"
        class="jse-field-bulk-actions__btn"
        @click="emit('apply', FIELD_HIDDEN_ATTRIBUTE, true)"
      >
        {{ t("schemaAttributes.bulkSetHidden") }}
      </button>
      <button
        type="button"
        class="jse-field-bulk-actions__btn"
        @click="emit('apply', FIELD_HIDDEN_ATTRIBUTE, false)"
      >
        {{ t("schemaAttributes.bulkClearHidden") }}
      </button>
    </div>
  </fieldset>
</template>

<style scoped>
.jse-field-bulk-actions {
  margin-top: 0.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px dashed var(--jse-border, #c8c8c8);
  border-radius: 4px;
}

.jse-field-bulk-actions legend {
  padding: 0 0.25rem;
  font-size: 0.9rem;
}

.jse-field-bulk-actions__hint {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--jse-text-muted, #666);
}

.jse-field-bulk-actions__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.jse-field-bulk-actions__btn {
  padding: 0.3rem 0.55rem;
  border: 1px solid var(--jse-border, #c8c8c8);
  border-radius: 4px;
  background: var(--jse-surface, #fff);
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
}

.jse-field-bulk-actions__btn:hover {
  background: var(--jse-surface-muted, #f4f4f4);
}
</style>
