<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { StringSchema } from "@jsonschema-editor/json-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useScopedField } from "../../../composables/useScopedField";
import JseInput from "../../atoms/JseInput.vue";
import JseSchemaFormField from "./JseSchemaFormField.vue";

const props = defineProps<{
  schema: SchemaNode;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const labelRef = toRef(props, "label");
const i18nKeyRef = toRef(props, "i18nKey");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope);
const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
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
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <JseInput
      :model-value="value as string"
      class="jse-field__input"
      :type="inputType"
      :disabled="readonly"
      @update:model-value="value = $event"
    />
  </JseSchemaFormField>
</template>
