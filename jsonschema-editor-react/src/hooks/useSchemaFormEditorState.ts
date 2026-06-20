import { useCallback, useEffect, useMemo, useState } from "react";
import type { JsonSchemaObject, SchemaDocument } from "@jsonschema-editor/json-schema";
import { documentFromJSON } from "@jsonschema-editor/json-schema";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { UiElement, UiSchemaObject } from "@jsonschema-editor/ui-schema";
import type { SchemaPath } from "../utils/schema-editor.js";
import type { UiPath } from "../utils/ui-editor.js";
import { syncUiSchemaWithSchema } from "../utils/ui-schema-sync.js";
import { useJseI18n } from "../context/JseI18nContext.js";
import type { EditorContextValue } from "../context/EditorContext.js";

export type EditorTab = "schema" | "ui";

export interface SchemaFormEditorCallbacks {
  onSchemaChange: (schema: SchemaDocument) => void;
  onUiSchemaChange: (uiSchema: UiSchema) => void;
}

export function useSchemaFormEditorState(
  schema: SchemaDocument,
  uiSchema: UiSchema,
  callbacks: SchemaFormEditorCallbacks,
) {
  const { t } = useJseI18n();

  const editorTabs = useMemo(
    () => [
      {
        id: "schema" as const,
        label: t("editor.tabs.schema.label"),
        description: t("editor.tabs.schema.description"),
      },
      {
        id: "ui" as const,
        label: t("editor.tabs.ui.label"),
        description: t("editor.tabs.ui.description"),
      },
    ],
    [t],
  );

  const [editorTab, setEditorTab] = useState<EditorTab>("schema");
  const [selectedSchemaPath, setSelectedSchemaPath] = useState<SchemaPath>([]);
  const [selectedUiPath, setSelectedUiPath] = useState<UiPath>([]);
  const [uiManualEdit, setUiManualEdit] = useState(false);
  const [showAdvancedJson, setShowAdvancedJson] = useState(false);
  const [documentRef, setDocumentRef] = useState(schema);
  const [uiSchemaRef, setUiSchemaRef] = useState(uiSchema);

  useEffect(() => {
    setDocumentRef(schema);
  }, [schema]);

  useEffect(() => {
    setUiSchemaRef(uiSchema);
  }, [uiSchema]);

  const uiRoot = uiSchemaRef.root;

  const updateDocument = useCallback(
    (next: SchemaDocument) => {
      setDocumentRef(next);
      callbacks.onSchemaChange(next);
      const syncedRoot = syncUiSchemaWithSchema(next, uiSchemaRef.root);
      if (syncedRoot !== uiSchemaRef.root) {
        const nextUi = new UiSchema(syncedRoot);
        setUiSchemaRef(nextUi);
        callbacks.onUiSchemaChange(nextUi);
      }
    },
    [callbacks, uiSchemaRef.root],
  );

  const updateUiRoot = useCallback(
    (next: UiElement) => {
      setUiManualEdit(true);
      const nextUi = new UiSchema(next);
      setUiSchemaRef(nextUi);
      callbacks.onUiSchemaChange(nextUi);
    },
    [callbacks],
  );

  const regenerateUiFromSchema = useCallback(() => {
    setUiManualEdit(false);
    const generated = UiSchema.generateForSchema(documentRef.root, "#", (ref) =>
      documentRef.resolveRef(ref),
    );
    setUiSchemaRef(generated);
    callbacks.onUiSchemaChange(generated);
  }, [callbacks, documentRef]);

  const updateUiSchema = useCallback(
    (next: UiSchema, manual = true) => {
      if (manual) setUiManualEdit(true);
      setUiSchemaRef(next);
      callbacks.onUiSchemaChange(next);
    },
    [callbacks],
  );

  const schemaJson = useMemo(
    () => JSON.stringify(documentRef.toJSON(), null, 2),
    [documentRef],
  );

  const uiSchemaJson = useMemo(
    () => JSON.stringify(uiSchemaRef.toJSON(), null, 2),
    [uiSchemaRef],
  );

  const setSchemaJson = useCallback(
    (raw: string) => {
      try {
        const parsed = JSON.parse(raw) as JsonSchemaObject;
        updateDocument(documentFromJSON(parsed));
      } catch {
        /* invalid JSON while typing */
      }
    },
    [updateDocument],
  );

  const setUiSchemaJson = useCallback(
    (raw: string) => {
      try {
        const parsed = JSON.parse(raw) as UiSchemaObject;
        setUiManualEdit(true);
        const next = UiSchema.fromJSON(parsed);
        setUiSchemaRef(next);
        callbacks.onUiSchemaChange(next);
      } catch {
        /* invalid JSON while typing */
      }
    },
    [callbacks],
  );

  const editorContext = useMemo(
    (): EditorContextValue => ({
      document: documentRef,
      schema: documentRef.root,
      uiSchema: uiSchemaRef,
      updateDocument,
      updateSchema: updateDocument,
      updateUiSchema,
    }),
    [documentRef, uiSchemaRef, updateDocument, updateUiSchema],
  );

  return {
    editorTab,
    setEditorTab,
    editorTabs,
    selectedSchemaPath,
    setSelectedSchemaPath,
    selectedUiPath,
    setSelectedUiPath,
    uiManualEdit,
    showAdvancedJson,
    setShowAdvancedJson,
    documentRef,
    uiSchemaRef,
    uiRoot,
    updateDocument,
    updateUiRoot,
    regenerateUiFromSchema,
    schemaJson,
    setSchemaJson,
    uiSchemaJson,
    setUiSchemaJson,
    editorContext,
  };
}
