<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { resolveCompositionAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { useScopedField } from "../../../composables/useScopedField";
import { useSchemaFormTypeRegistry } from "../../../composables/useRegistries";
import { createFormFieldMatchContext } from "../../../registry/form-field-context";
import DefaultFormField from "./DefaultFormField.vue";
import OneOfFormField from "./OneOfFormField.vue";

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
const rootData = defineModel<Record<string, unknown>>({ required: true });
const typeRegistry = useSchemaFormTypeRegistry();
const { fieldSchema } = useScopedField(rootSchema, rootData, props.scope, documentRef);

const oneOfComposition = computed(() => resolveCompositionAtScope(props.schema, props.scope));

const matchContext = computed(() =>
  createFormFieldMatchContext({
    scope: props.scope,
    label: props.label,
    i18nKey: props.i18nKey,
    readonly: props.readonly,
    fieldSchema: fieldSchema.value,
    rootSchema: props.schema,
  }),
);

const resolvedComponent = computed(() => {
  if (oneOfComposition.value) return OneOfFormField;
  const node = fieldSchema.value ?? props.schema;
  return typeRegistry.resolve(node, matchContext.value) ?? DefaultFormField;
});
</script>

<template>
  <component
    :is="resolvedComponent"
    v-model="rootData"
    :schema="schema"
    :document="document"
    :scope="scope"
    :label="label"
    :i18n-key="i18nKey"
    :readonly="readonly"
  />
</template>
