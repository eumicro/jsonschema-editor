<script setup lang="ts">
import { computed, toRef, watch } from "vue";
import type { ArraySchema, SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { buildArrayItemScope } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { resolveControlDetailSchema } from "@jsonschema-editor/ui-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useJseI18n } from "../../../composables/useJseI18n";
import { useArrayFieldValue, useScopedField } from "../../../composables/useScopedField";
import {
  getArrayItemLabelValue,
  resolveItemLabelProp,
  setArrayItemLabelValue,
  type ElementLabelProp,
} from "../../../utils/array-item-label";
import { isSchemaFieldHidden, isSchemaFieldReadOnly } from "../../../utils/field-behavior";
import JseButton from "../../atoms/JseButton.vue";
import UiFormElementResolver from "../ui/UiFormElementResolver.vue";
import SchemaFormFieldResolver from "./SchemaFormFieldResolver.vue";

const props = defineProps<{
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
  /** JSON Forms `options.detail` UI Schema for each array item. */
  detail?: UiElement;
  /** JSON Forms `options.elementLabelProp`. */
  elementLabelProp?: ElementLabelProp;
  /** Full Control options (fallback for elementLabelProp). */
  controlOptions?: Readonly<Record<string, unknown>>;
}>();

const rootSchema = toRef(props, "schema");
const documentRef = toRef(props, "document");
const labelRef = toRef(props, "label");
const i18nKeyRef = toRef(props, "i18nKey");
const rootData = defineModel<Record<string, unknown>>({ required: true });

const { t } = useJseI18n();
const { fieldSchema, path } = useScopedField(rootSchema, rootData, props.scope, documentRef);
const { displayLabel, description } = useFormFieldLabel(
  rootSchema,
  props.scope,
  labelRef,
  fieldSchema,
  i18nKeyRef,
);

const arraySchema = computed((): ArraySchema | undefined => {
  const node = fieldSchema.value;
  return node?.nodeKind === "array" ? (node as ArraySchema) : undefined;
});

const itemSchema = computed(() => resolveControlDetailSchema(props.document ?? null, props.scope));

const labelProp = computed(() =>
  resolveItemLabelProp(
    props.elementLabelProp !== undefined
      ? { elementLabelProp: props.elementLabelProp }
      : props.controlOptions,
    itemSchema.value,
  ),
);

const items = useArrayFieldValue(rootData, path);

watch(
  [items, arraySchema],
  () => {
    if (arraySchema.value && !Array.isArray(items.value)) {
      items.value = [];
    }
  },
  { immediate: true },
);

const canAdd = computed(
  () => !effectiveReadonly.value && (arraySchema.value?.canAddItem(items.value.length) ?? false),
);
const canRemove = computed(
  () => !effectiveReadonly.value && (arraySchema.value?.canRemoveItem(items.value.length) ?? false),
);

const isHidden = computed(() => isSchemaFieldHidden(fieldSchema.value));
const effectiveReadonly = computed(() =>
  isSchemaFieldReadOnly(fieldSchema.value, props.readonly),
);

function itemScope(index: number): string {
  return buildArrayItemScope(props.scope, index);
}

function itemTitle(index: number): string {
  const prop = labelProp.value;
  if (!prop) return t("arrayList.itemTitle", { index: index + 1 });
  const value = getArrayItemLabelValue(items.value[index], prop).trim();
  return value || t("arrayList.itemTitle", { index: index + 1 });
}

function onItemLabelInput(index: number, event: Event): void {
  const prop = labelProp.value;
  if (!prop || effectiveReadonly.value) return;
  const value = (event.target as HTMLInputElement).value;
  const next = [...items.value];
  next[index] = setArrayItemLabelValue(next[index], prop, value);
  items.value = next;
}

function addItem(): void {
  const array = arraySchema.value;
  if (!array || !canAdd.value) return;
  items.value = [...items.value, array.createDefaultItemValue(items.value.length)];
}

function removeItem(index: number): void {
  if (!canRemove.value) return;
  items.value = items.value.filter((_, itemIndex) => itemIndex !== index);
}
</script>

<template>
  <fieldset
    v-if="arraySchema?.supportsDynamicItems() && !isHidden"
    class="jse-group jse-array-field"
  >
    <legend v-if="displayLabel">{{ displayLabel }}</legend>
    <p v-if="description" class="jse-field__hint">{{ description }}</p>

    <p v-if="items.length === 0" class="jse-array-field__empty">
      {{ t("arrayList.empty") }}
    </p>

    <article
      v-for="(_, index) in items"
      :key="`${scope}-item-${index}-of-${items.length}`"
      class="jse-array-item"
    >
      <header class="jse-array-item__header">
        <input
          v-if="labelProp"
          type="text"
          class="jse-array-item__title-input"
          :value="getArrayItemLabelValue(items[index], labelProp)"
          :placeholder="t('arrayList.itemTitle', { index: index + 1 })"
          :readonly="effectiveReadonly"
          :aria-label="t('arrayList.itemLabelAria', { index: index + 1 })"
          @input="onItemLabelInput(index, $event)"
        />
        <span v-else class="jse-array-item__title">{{ itemTitle(index) }}</span>
        <JseButton
          v-if="canRemove"
          type="button"
          class="jse-array-item__remove"
          @click="removeItem(index)"
        >
          {{ t("arrayList.removeItem") }}
        </JseButton>
      </header>

      <UiFormElementResolver
        v-if="detail"
        v-model="rootData"
        :element="detail"
        :schema="schema"
        :document="document"
        :readonly="effectiveReadonly"
        :scope-prefix="itemScope(index)"
      />
      <SchemaFormFieldResolver
        v-else
        v-model="rootData"
        :schema="schema"
        :document="document"
        :scope="itemScope(index)"
        :readonly="effectiveReadonly"
      />
    </article>

    <JseButton v-if="canAdd" type="button" class="jse-array-field__add" @click="addItem">
      {{ t("arrayList.addItem") }}
    </JseButton>
  </fieldset>
</template>
