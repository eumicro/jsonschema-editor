<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { resolveCompositionAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { useScopedField } from "../../../composables/useScopedField";
import { useSchemaFormTypeRegistry } from "../../../composables/useRegistries";
import { createFormFieldMatchContext } from "../../../registry/form-field-context";
import type { ElementLabelProp } from "../../../utils/array-item-label";
import { isSchemaFieldHidden, isSchemaFieldReadOnly } from "../../../utils/field-behavior";
import DefaultFormField from "./DefaultFormField.vue";
import OneOfFormField from "./OneOfFormField.vue";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
  /** JSON Forms `options.detail` for array item UI (when resolved to ArrayFormField). */
  detail?: UiElement;
  /** JSON Forms `options.elementLabelProp`. */
  elementLabelProp?: ElementLabelProp;
  /** Full Control options (fallback for elementLabelProp). */
  controlOptions?: Readonly<Record<string, unknown>>;
}>();

const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");
const rootData = defineModel<Record<string, unknown>>({ required: true });
const typeRegistry = useSchemaFormTypeRegistry();
const { fieldSchema } = useScopedField(rootSchema, rootData, props.scope, documentRef);

const oneOfComposition = computed(() => {
  const resolveRef = documentRef.value
    ? (ref: string) => documentRef.value!.resolveRef(ref)
    : undefined;
  return resolveCompositionAtScope(props.schema, props.scope, resolveRef);
});

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

const isHidden = computed(() => isSchemaFieldHidden(fieldSchema.value));
const effectiveReadonly = computed(() =>
  isSchemaFieldReadOnly(fieldSchema.value, props.readonly),
);
</script>

<template>
  <component
    v-if="!isHidden"
    :is="resolvedComponent"
    v-model="rootData"
    :schema="schema"
    :document="document"
    :scope="scope"
    :label="label"
    :i18n-key="i18nKey"
    :readonly="effectiveReadonly"
    :detail="detail"
    :element-label-prop="elementLabelProp"
    :control-options="controlOptions"
  />
</template>
