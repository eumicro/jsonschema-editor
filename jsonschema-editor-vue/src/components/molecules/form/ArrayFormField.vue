<script setup lang="ts">
import { computed, toRef, watch } from "vue";
import type { ArraySchema, SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { buildArrayItemScope } from "@jsonschema-editor/json-schema";
import { useFormFieldLabel } from "../../../composables/useFormFieldLabel";
import { useJseI18n } from "../../../composables/useJseI18n";
import { useArrayFieldValue, useScopedField } from "../../../composables/useScopedField";
import { isSchemaFieldHidden, isSchemaFieldReadOnly } from "../../../utils/field-behavior";
import JseButton from "../../atoms/JseButton.vue";
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
        <span class="jse-array-item__title">
          {{ t("arrayList.itemTitle", { index: index + 1 }) }}
        </span>
        <JseButton
          v-if="canRemove"
          type="button"
          class="jse-array-item__remove"
          @click="removeItem(index)"
        >
          {{ t("arrayList.removeItem") }}
        </JseButton>
      </header>

      <SchemaFormFieldResolver
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
