import { computed, provide, ref, shallowRef, watch, type Ref } from "vue";
import type { JsonSchemaObject, SchemaDocument } from "@jsonschema-editor/json-schema";
import { documentFromJSON } from "@jsonschema-editor/json-schema";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { UiElement, UiSchemaObject } from "@jsonschema-editor/ui-schema";
import type { SchemaPath } from "../utils/schema-editor";
import type { UiPath } from "../utils/ui-editor";
import { EDITOR_CONTEXT_KEY } from "../registry/renderer-registry";

export type EditorTab = "schema" | "ui";

export const EDITOR_TABS = [
  {
    id: "schema" as const,
    label: "Schema",
    description: "Datenstruktur, Typen und Validierung definieren.",
  },
  {
    id: "ui" as const,
    label: "Schema-UI",
    description: "Layout, Gruppierung und Darstellung des Formulars anpassen.",
  },
];

export interface SchemaFormEditorEmits {
  (event: "update:schema", schema: SchemaDocument): void;
  (event: "update:uiSchema", uiSchema: UiSchema): void;
}

export function useSchemaFormEditorState(
  schema: Ref<SchemaDocument>,
  uiSchema: Ref<UiSchema>,
  emit: SchemaFormEditorEmits,
) {
  const editorTab = ref<EditorTab>("schema");
  const selectedSchemaPath = ref<SchemaPath>([]);
  const selectedUiPath = ref<UiPath>([]);
  const uiManualEdit = ref(false);
  const showAdvancedJson = ref(false);

  const documentRef = shallowRef(schema.value);
  const uiSchemaRef = shallowRef(uiSchema.value);

  watch(
    schema,
    (document) => {
      documentRef.value = document;
    },
    { immediate: true },
  );

  watch(uiSchema, (next) => {
    uiSchemaRef.value = next;
  });

  const uiRoot = computed(() => uiSchemaRef.value.root);

  function updateDocument(next: SchemaDocument) {
    documentRef.value = next;
    emit("update:schema", next);
    if (!uiManualEdit.value) {
      const generated = UiSchema.generateForSchema(next.root, "#", (ref) => next.resolveRef(ref));
      uiSchemaRef.value = generated;
      emit("update:uiSchema", generated);
    }
  }

  function updateUiRoot(next: UiElement) {
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

  function updateUiSchema(next: UiSchema, manual = true) {
    if (manual) uiManualEdit.value = true;
    uiSchemaRef.value = next;
    emit("update:uiSchema", next);
  }

  const schemaJson = computed({
    get: () => JSON.stringify(documentRef.value.toJSON(), null, 2),
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
    get: () => JSON.stringify(uiSchemaRef.value.toJSON(), null, 2),
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
    updateUiSchema,
  });

  return {
    editorTab,
    selectedSchemaPath,
    selectedUiPath,
    uiManualEdit,
    showAdvancedJson,
    documentRef,
    uiSchemaRef,
    uiRoot,
    updateDocument,
    updateUiRoot,
    regenerateUiFromSchema,
    schemaJson,
    uiSchemaJson,
  };
}
