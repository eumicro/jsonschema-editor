<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useScopedField } from "../../../composables/useScopedField";
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

const enumValues = computed(() => resolvedSchema.value?.enumValues ?? []);
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description">
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
  </JseSchemaFormField>
</template>
