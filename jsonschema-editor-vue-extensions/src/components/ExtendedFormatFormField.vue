<script setup lang="ts">
import { computed, toRef } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { StringSchema } from "@jsonschema-editor/json-schema";
import {
  JseInput,
  JseSchemaFormField,
  useFormFieldLabel,
  useScopedField,
} from "@jsonschema-editor/vue";

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

const format = computed(() => {
  const node = resolvedSchema.value;
  return node instanceof StringSchema ? node.format : undefined;
});

const inputType = computed((): string => {
  switch (format.value) {
    case "email":
      return "email";
    case "uri":
      return "url";
    case "phone":
      return "tel";
    default:
      return "text";
  }
});

const autocomplete = computed((): string | undefined => {
  switch (format.value) {
    case "email":
      return "email";
    case "uri":
      return "url";
    case "phone":
      return "tel";
    default:
      return undefined;
  }
});

const linkHref = computed((): string | null => {
  if (format.value !== "uri") return null;
  const raw = value.value;
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return raw;
  } catch {
    return null;
  }
  return null;
});
</script>

<template>
  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">
    <JseInput
      :model-value="value as string"
      class="jse-field__input jse-field__input--format"
      :type="inputType"
      :autocomplete="autocomplete"
      :disabled="readonly"
      @update:model-value="value = $event"
    />
    <a
      v-if="linkHref"
      class="jse-field__link"
      :href="linkHref"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ linkHref }}
    </a>
  </JseSchemaFormField>
</template>
