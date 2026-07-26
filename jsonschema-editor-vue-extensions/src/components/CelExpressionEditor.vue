<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import {
  createCelExpressionEditor,
  type CelExpressionEditorHandle,
} from "@jsonschema-editor/json-schema-extensions/cel-editor";

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
  placeholder?: string;
  document?: SchemaDocument;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [];
}>();

const host = ref<HTMLElement | null>(null);
let editor: CelExpressionEditorHandle | null = null;
let syncing = false;

onMounted(() => {
  if (!host.value) return;
  editor = createCelExpressionEditor(host.value, {
    value: props.modelValue,
    readOnly: props.disabled === true,
    placeholder: props.placeholder,
    schemaDocument: props.document,
    onChange: (value) => {
      if (syncing) return;
      emit("update:modelValue", value);
    },
    onBlur: () => emit("blur"),
  });
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor) return;
    syncing = true;
    editor.setValue(value);
    syncing = false;
  },
);

watch(
  () => props.disabled === true,
  (disabled) => {
    editor?.setReadOnly(disabled);
  },
);

watch(
  () => props.document,
  (document) => {
    editor?.setSchemaDocument(document);
  },
);

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <div ref="host" class="jse-cel-expression-editor" />
</template>

<style scoped>
.jse-cel-expression-editor {
  min-height: 5.5rem;
}
</style>
