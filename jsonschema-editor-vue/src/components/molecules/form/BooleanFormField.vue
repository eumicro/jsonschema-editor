<script setup lang="ts">
import { toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useScopedField } from "../../../composables/useScopedField";
import JseCheckbox from "../../atoms/JseCheckbox.vue";
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
const { displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
);
</script>

<template>
  <JseSchemaFormField boolean :label="displayLabel" :description="description">
    <JseCheckbox
      :model-value="value as boolean"
      :disabled="readonly"
      @update:model-value="value = $event"
    />
  </JseSchemaFormField>
</template>
