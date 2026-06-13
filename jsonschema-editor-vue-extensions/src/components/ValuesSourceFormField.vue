<script setup lang="ts">

import { computed, ref, toRef, watch } from "vue";

import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";

import {

  isFetchValuesSource,

  isStaticValuesSource,

  readValuesSourceConfig,

  type FetchValuesSource,

} from "@jsonschema-editor/json-schema-extensions";

import {

  JseSchemaFormField,

  JseSelect,

  useFormFieldLabel,

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

const { fieldSchema, value } = useScopedField(rootSchema, rootData, props.scope, documentRef);

const { resolvedSchema, displayLabel, description } = useFormFieldLabel(

  rootSchema,

  props.scope,

  labelRef,

  fieldSchema,

  i18nKeyRef,

);



type SelectOption = { value: string; label: string };



const options = ref<SelectOption[]>([]);

const loading = ref(false);

const loadError = ref<string | null>(null);



const valuesSource = computed(() =>

  resolvedSchema.value ? readValuesSourceConfig(resolvedSchema.value) : undefined,

);



function resolveItems(data: unknown, config: FetchValuesSource): unknown[] {

  if (Array.isArray(data)) return data;

  if (!config.itemsPath) return [];

  const resolved = config.itemsPath.split(".").reduce<unknown>((current: unknown, segment: string) => {

    if (current && typeof current === "object") {

      return (current as Record<string, unknown>)[segment];

    }

    return undefined;

  }, data);

  return Array.isArray(resolved) ? resolved : [];

}



async function loadOptions(config: NonNullable<typeof valuesSource.value>) {

  if (isStaticValuesSource(config)) {

    options.value = config.values.map((entry: string) => ({ value: entry, label: entry }));

    loadError.value = null;

    return;

  }



  if (!isFetchValuesSource(config)) {

    options.value = [];

    return;

  }



  loading.value = true;

  loadError.value = null;

  try {

    const response = await fetch(config.url);

    if (!response.ok) {

      throw new Error(`${response.status} ${response.statusText}`);

    }

    const payload = await response.json();

    const items = resolveItems(payload, config);

    if (!Array.isArray(items)) {

      throw new Error("Response does not contain an option list");

    }



    const valueField = config.valueField ?? "id";

    const labelField = config.labelField ?? "name";

    options.value = items.map((item) => {

      if (item && typeof item === "object") {

        const record = item as Record<string, unknown>;

        const optionValue = record[valueField];

        const optionLabel = record[labelField] ?? optionValue;

        return {

          value: String(optionValue ?? ""),

          label: String(optionLabel ?? optionValue ?? ""),

        };

      }

      return { value: String(item), label: String(item) };

    });

  } catch (error) {

    options.value = [];

    loadError.value = error instanceof Error ? error.message : "Failed to load options";

  } finally {

    loading.value = false;

  }

}



watch(

  valuesSource,

  (config) => {

    if (!config) {

      options.value = [];

      loadError.value = null;

      return;

    }

    void loadOptions(config);

  },

  { immediate: true },

);

</script>



<template>

  <JseSchemaFormField :label="displayLabel" :description="description" :scope="scope">

    <JseSelect

      :model-value="value as string | number"

      class="jse-field__input"

      :disabled="readonly || loading"

      @update:model-value="value = $event"

    >

      <option v-if="loading" disabled value="">…</option>

      <option

        v-for="option in options"

        :key="`${option.value}-${option.label}`"

        :value="option.value"

      >

        {{ option.label }}

      </option>

    </JseSelect>

    <p v-if="loadError" class="jse-field__hint jse-field__hint--error">{{ loadError }}</p>

  </JseSchemaFormField>

</template>


