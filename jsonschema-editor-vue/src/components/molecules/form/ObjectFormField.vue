<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaDocument, SchemaNode, ObjectSchema } from "@jsonschema-editor/json-schema";
import { buildPropertyScope } from "@jsonschema-editor/ui-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useScopedField } from "../../../composables/useScopedField";
import SchemaFormFieldResolver from "./SchemaFormFieldResolver.vue";

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

const { fieldSchema } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { displayLabel } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

const objectSchema = computed((): ObjectSchema | undefined => {
  const node = fieldSchema.value;
  return node?.nodeKind === "object" ? (node as ObjectSchema) : undefined;
});

const properties = computed(() => {
  if (!objectSchema.value) return [];
  return [...objectSchema.value.properties.entries()];
});
</script>

<template>
  <fieldset v-if="objectSchema" class="jse-group jse-object-field">
    <legend v-if="displayLabel">{{ displayLabel }}</legend>
    <SchemaFormFieldResolver
      v-for="[name, propSchema] in properties"
      :key="name"
      v-model="rootData"
      :schema="schema"
      :document="document"
      :scope="buildPropertyScope(scope, name)"
      :readonly="readonly"
    />
  </fieldset>
</template>
