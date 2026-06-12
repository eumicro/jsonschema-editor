<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useScopedField } from "../../../composables/useScopedField";
import JseCheckbox from "../../atoms/JseCheckbox.vue";
import JseInput from "../../atoms/JseInput.vue";
import JseSelect from "../../atoms/JseSelect.vue";
import JseSchemaFormField from "./JseSchemaFormField.vue";

const props = defineProps<{
  schema: SchemaNode;
  scope: string;
  label?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const labelRef = toRef(props, "label");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope);
const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
);

const inputType = computed(() => {
  switch (resolvedSchema.value?.kind) {
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "checkbox";
    default:
      return "text";
  }
});

const enumValues = computed(() => resolvedSchema.value?.enumValues ?? []);
const isCheckbox = computed(() => inputType.value === "checkbox");
</script>

<template>
  <JseSchemaFormField
    :boolean="isCheckbox"
    :label="displayLabel"
    :description="description"
  >
    <JseSelect
      v-if="enumValues.length"
      :model-value="value as string | number"
      class="jse-field__input"
      :disabled="readonly"
      @update:model-value="value = $event"
    >
      <option v-for="option in enumValues" :key="String(option)" :value="option as string | number">
        {{ option }}
      </option>
    </JseSelect>

    <JseCheckbox
      v-else-if="isCheckbox"
      :model-value="value as boolean"
      class="jse-field__checkbox"
      :disabled="readonly"
      @update:model-value="value = $event"
    />

    <JseInput
      v-else
      :model-value="value as string | number"
      class="jse-field__input"
      :type="inputType"
      :disabled="readonly"
      @update:model-value="value = $event"
    />
  </JseSchemaFormField>
</template>
