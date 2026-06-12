<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { useScopedField } from "../../../composables/useScopedField";
import JseSelect from "../../atoms/JseSelect.vue";

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
const enumValues = computed(() => resolvedSchema.value?.enumValues ?? []);
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
    <JseSelect
      :model-value="value as string | number"
      class="jse-field__input"
      :disabled="readonly"
      @update:model-value="value = $event"
    >
      <option v-for="option in enumValues" :key="String(option)" :value="option as string | number">
        {{ option }}
      </option>
    </JseSelect>
  </div>
</template>
