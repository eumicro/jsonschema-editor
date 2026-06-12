<script setup lang="ts">
import { computed, provide, ref, shallowRef, watch } from "vue";
import type { JsonSchemaObject, SchemaDocument } from "@jsonschema-editor/json-schema";
import { documentFromJSON } from "@jsonschema-editor/json-schema";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { UiSchemaObject } from "@jsonschema-editor/ui-schema";
import JseButton from "../atoms/JseButton.vue";
import JseTabs from "../atoms/JseTabs.vue";
import JseTextarea from "../atoms/JseTextarea.vue";
import SchemaStructureEditor from "../organisms/SchemaStructureEditor.vue";
import UiStructureEditor from "../organisms/UiStructureEditor.vue";
import type { SchemaPath } from "../../utils/schema-editor";
import type { UiPath } from "../../utils/ui-editor";
import { EDITOR_CONTEXT_KEY } from "../../registry/renderer-registry";

const props = defineProps<{
  schema: SchemaDocument;
  uiSchema: UiSchema;
}>();

const emit = defineEmits<{
  "update:schema": [schema: SchemaDocument];
  "update:uiSchema": [uiSchema: UiSchema];
}>();

const editorTab = ref<"schema" | "ui">("schema");
const selectedSchemaPath = ref<SchemaPath>([]);
const selectedUiPath = ref<UiPath>([]);
const uiManualEdit = ref(false);
const showAdvancedJson = ref(false);

const documentRef = shallowRef(props.schema);
const uiSchemaRef = shallowRef(props.uiSchema);

watch(
  () => props.schema,
  (document) => {
    documentRef.value = document;
  },
  { immediate: true },
);

watch(
  () => props.uiSchema,
  (uiSchema) => {
    uiSchemaRef.value = uiSchema;
  },
);

function updateDocument(next: SchemaDocument) {
  documentRef.value = next;
  emit("update:schema", next);
  if (!uiManualEdit.value) {
    const generated = UiSchema.generateForSchema(next.root, "#", (ref) => next.resolveRef(ref));
    uiSchemaRef.value = generated;
    emit("update:uiSchema", generated);
  }
}

function updateUiRoot(next: import("@jsonschema-editor/ui-schema").UiElement) {
  uiManualEdit.value = true;
  const nextUi = new UiSchema(next);
  uiSchemaRef.value = nextUi;
  emit("update:uiSchema", nextUi);
}

function regenerateUiFromSchema() {
  uiManualEdit.value = false;
  const doc = documentRef.value;
  const generated = UiSchema.generateForSchema(doc.root, "#", (ref) => doc.resolveRef(ref));
  uiSchemaRef.value = generated;
  emit("update:uiSchema", generated);
}

const schemaJson = computed({
  get: () => JSON.stringify(props.schema.toJSON(), null, 2),
  set: (raw: string) => {
    try {
      const parsed = JSON.parse(raw) as JsonSchemaObject;
      updateDocument(documentFromJSON(parsed));
    } catch {
      /* invalid JSON while typing */
    }
  },
});

const uiSchemaJson = computed({
  get: () => JSON.stringify(props.uiSchema.toJSON(), null, 2),
  set: (raw: string) => {
    try {
      const parsed = JSON.parse(raw) as UiSchemaObject;
      uiManualEdit.value = true;
      const next = UiSchema.fromJSON(parsed);
      uiSchemaRef.value = next;
      emit("update:uiSchema", next);
    } catch {
      /* invalid JSON while typing */
    }
  },
});

provide(EDITOR_CONTEXT_KEY, {
  document: documentRef,
  schema: computed(() => documentRef.value.root),
  uiSchema: uiSchemaRef,
  updateDocument,
  updateSchema: updateDocument,
  updateUiSchema: (next, manual = true) => {
    if (manual) uiManualEdit.value = true;
    uiSchemaRef.value = next;
    emit("update:uiSchema", next);
  },
});
</script>

<template>
  <div class="jse-editor">
    <section class="jse-editor__panel jse-editor__panel--main">
      <JseTabs
        v-model="editorTab"
        panel-id-prefix="jse-editor"
        :tabs="[
          {
            id: 'schema',
            label: 'Schema',
            description: 'Datenstruktur, Typen und Validierung definieren.',
          },
          {
            id: 'ui',
            label: 'Schema-UI',
            description: 'Layout, Gruppierung und Darstellung des Formulars anpassen.',
          },
        ]"
      />

      <div
        v-show="editorTab === 'schema'"
        id="jse-editor-schema"
        class="jse-editor__tab-panel"
        role="tabpanel"
        aria-labelledby="jse-editor-tab-schema"
      >
        <SchemaStructureEditor
          :document="documentRef"
          :selected-path="selectedSchemaPath"
          @update:document="updateDocument"
          @update:selected-path="selectedSchemaPath = $event"
        />
      </div>

      <div
        v-show="editorTab === 'ui'"
        id="jse-editor-ui"
        class="jse-editor__tab-panel"
        role="tabpanel"
        aria-labelledby="jse-editor-tab-ui"
      >
        <div v-if="uiManualEdit" class="jse-editor__banner">
          UI manuell bearbeitet.
          <JseButton type="button" @click="regenerateUiFromSchema">Aus Schema neu generieren</JseButton>
        </div>
        <UiStructureEditor
          :root="uiSchema.root"
          :selected-path="selectedUiPath"
          @update:root="updateUiRoot"
          @update:selected-path="selectedUiPath = $event"
        />
      </div>

      <details class="jse-editor__advanced" :open="showAdvancedJson">
        <summary @click.prevent="showAdvancedJson = !showAdvancedJson">JSON (Erweitert)</summary>
        <label v-show="editorTab === 'schema'" class="jse-editor__json">
          JSON Schema
          <JseTextarea v-model="schemaJson" :rows="8" />
        </label>
        <label v-show="editorTab === 'ui'" class="jse-editor__json">
          UI Schema
          <JseTextarea v-model="uiSchemaJson" :rows="8" />
        </label>
      </details>
    </section>
  </div>
</template>
