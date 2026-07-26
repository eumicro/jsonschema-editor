<script setup lang="ts">
import { onMounted, ref, toRef } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { todayIsoDate } from "@jsonschema-editor/json-schema-extensions";
import {
  JseInput,
  JseSchemaFormField,
  useFormFieldLabel,
  useJseI18n,
  useScopedField,
} from "@jsonschema-editor/vue";

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
const { t } = useJseI18n();

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

/** Seed today only once when the control is first created empty. */
const didSeedInitial = ref(false);

function setToday(): void {
  if (props.readonly) return;
  value.value = todayIsoDate();
}

onMounted(() => {
  if (didSeedInitial.value || props.readonly) return;
  didSeedInitial.value = true;
  if (value.value === undefined || value.value === null || value.value === "") {
    value.value = todayIsoDate();
  }
});
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <div class="jse-date-today">
      <JseInput
        :model-value="(value as string) ?? ''"
        class="jse-field__input jse-date-today__input"
        type="date"
        :disabled="readonly"
        @update:model-value="value = $event === '' ? undefined : $event"
      />
      <button
        type="button"
        class="jse-date-today__today"
        :disabled="readonly"
        @click="setToday"
      >
        {{ t("extensions.dateToday.today") }}
      </button>
    </div>
  </JseSchemaFormField>
</template>
