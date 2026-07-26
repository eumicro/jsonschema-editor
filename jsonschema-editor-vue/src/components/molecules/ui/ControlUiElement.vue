<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { composeScope, type Control } from "@jsonschema-editor/ui-schema";
import { resolveSchemaAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { useScopedField } from "../../../composables/useScopedField";
import { readElementLabelProp } from "../../../utils/array-item-label";
import SchemaFormFieldResolver from "../form/SchemaFormFieldResolver.vue";
import UiFormElementResolver from "./UiFormElementResolver.vue";

const props = defineProps<{
  element: Control;
  schema: SchemaNode;
  document?: SchemaDocument;
  readonly?: boolean;
  /** Absolute scope prefix when rendering nested `options.detail`. */
  scopePrefix?: string;
}>();

const data = defineModel<Record<string, unknown>>({ required: true });
const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");

const composedScope = computed(() =>
  props.scopePrefix ? composeScope(props.scopePrefix, props.element.scope) : props.element.scope,
);

const { fieldSchema } = useScopedField(rootSchema, data, composedScope, documentRef);

const resolveRef = computed(() =>
  props.document ? (ref: string) => props.document!.resolveRef(ref) : undefined,
);

const isArrayField = computed(() => fieldSchema.value?.nodeKind === "array");

const isObjectField = computed(() => {
  const node = resolveSchemaAtScope(props.schema, composedScope.value, resolveRef.value);
  return node?.nodeKind === "object";
});

const detail = computed(() => props.element.detail);
const elementLabelProp = computed(() => readElementLabelProp(props.element.options));
</script>

<template>
  <!-- Object controls with options.detail render the nested UI schema directly. -->
  <UiFormElementResolver
    v-if="detail && isObjectField && !isArrayField"
    v-model="data"
    :element="detail"
    :schema="schema"
    :document="document"
    :readonly="readonly"
    :scope-prefix="composedScope"
  />
  <!-- Arrays (incl. x-file) go through the type registry; detail props are forwarded. -->
  <SchemaFormFieldResolver
    v-else-if="element.elementKind === 'Control' && element.scope"
    v-model="data"
    :schema="schema"
    :document="document"
    :scope="composedScope"
    :label="element.label"
    :i18n-key="element.i18n"
    :readonly="readonly"
    :detail="detail"
    :element-label-prop="elementLabelProp"
    :control-options="element.options"
  />
</template>
