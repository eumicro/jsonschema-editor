<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { useScopedField } from "../../../composables/useScopedField";
import JseInput from "../../atoms/JseInput.vue";

const props = defineProps<{
  schema: SchemaNode;
  scope: string;
  label?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope);

const resolvedSchema = computed(() => fieldSchema.value ?? props.schema);
const displayLabel = computed(
  () => props.label ?? resolvedSchema.value?.title ?? props.scope.split("/").pop() ?? "Feld",
);
</script>

<template>
  <div class="jse-field">
    <label class="jse-field__label">
      {{ displayLabel }}
      <span v-if="resolvedSchema?.description" class="jse-field__hint">
        {{ resolvedSchema.description }}
      </span>
    </label>
    <JseInput
      :model-value="value as number"
      class="jse-field__input"
      type="number"
      :disabled="readonly"
      @update:model-value="value = $event"
    />
  </div>
</template>
