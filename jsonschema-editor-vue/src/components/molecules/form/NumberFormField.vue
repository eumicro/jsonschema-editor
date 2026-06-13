<script setup lang="ts">
import { toRef } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useScopedField } from "../../../composables/useScopedField";
import JseInput from "../../atoms/JseInput.vue";
import JseSchemaFormField from "./JseSchemaFormField.vue";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
}>();

const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");
const labelRef = toRef(props, "label");
const i18nKeyRef = toRef(props, "i18nKey");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

function onInput(raw: string | number): void {
  value.value = raw === "" ? undefined : Number(raw);
}
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <JseInput
      :model-value="value as number"
      class="jse-field__input"
      type="number"
      :disabled="readonly"
      @update:model-value="onInput"
    />
  </JseSchemaFormField>
</template>
