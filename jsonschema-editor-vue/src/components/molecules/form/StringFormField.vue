<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { StringSchema } from "@jsonschema-editor/json-schema";
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

const inputType = computed((): string => {
  const node = resolvedSchema.value;
  if (!(node instanceof StringSchema)) return "text";
  if (node.format === "date") return "date";
  if (node.format === "date-time") return "datetime-local";
  return "text";
});
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
      :model-value="value as string"
      class="jse-field__input"
      :type="inputType"
      :disabled="readonly"
      @update:model-value="value = $event"
    />
  </div>
</template>
