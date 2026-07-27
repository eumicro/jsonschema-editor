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
  options: { readonly?: boolean } = {},
) {
  const { t } = useJseI18n();
  const readonly = options.readonly ?? false;
  const onSchemaChange = callbacks.onSchemaChange;
  const onUiSchemaChange = callbacks.onUiSchemaChange;

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
    // Do not clobber in-progress UI edits when a sibling state update
    // (e.g. messages) re-renders with a briefly stale uiSchema prop.
    if (uiManualEdit) return;
    setUiSchemaRef(uiSchema);
  }, [uiSchema, uiManualEdit]);

  const uiRoot = uiSchemaRef.root;

  const updateDocument = useCallback(
    (next: SchemaDocument) => {
      if (readonly) return;
      setDocumentRef(next);
      onSchemaChange(next);
      const syncedRoot = syncUiSchemaWithSchema(next, uiSchemaRef.root);
      if (syncedRoot !== uiSchemaRef.root) {
        const nextUi = new UiSchema(syncedRoot);
        setUiSchemaRef(nextUi);
        onUiSchemaChange(nextUi);
      }
    },
    [onSchemaChange, onUiSchemaChange, readonly, uiSchemaRef.root],
  );

  const updateUiRoot = useCallback(
    (next: UiElement) => {
      if (readonly) return;
      setUiManualEdit(true);
      const nextUi = new UiSchema(next);
      setUiSchemaRef(nextUi);
      onUiSchemaChange(nextUi);
    },
    [onUiSchemaChange, readonly],
  );

  const regenerateUiFromSchema = useCallback(() => {
    if (readonly) return;
    setUiManualEdit(false);
    const generated = UiSchema.generateForSchema(documentRef.root, "#", (ref) =>
      documentRef.resolveRef(ref),
    );
    setUiSchemaRef(generated);
    onUiSchemaChange(generated);
  }, [documentRef, onUiSchemaChange, readonly]);

  const updateUiSchema = useCallback(
    (next: UiSchema, manual = true) => {
      if (readonly) return;
      if (manual) setUiManualEdit(true);
      setUiSchemaRef(next);
      onUiSchemaChange(next);
    },
    [onUiSchemaChange, readonly],
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
      if (readonly) return;
      try {
        const parsed = JSON.parse(raw) as JsonSchemaObject;
        updateDocument(documentFromJSON(parsed));
      } catch {
        /* invalid JSON while typing */
      }
    },
    [readonly, updateDocument],
  );

  const setUiSchemaJson = useCallback(
    (raw: string) => {
      if (readonly) return;
      try {
        const parsed = JSON.parse(raw) as UiSchemaObject;
        setUiManualEdit(true);
        const next = UiSchema.fromJSON(parsed);
        setUiSchemaRef(next);
        onUiSchemaChange(next);
      } catch {
        /* invalid JSON while typing */
      }
    },
    [onUiSchemaChange, readonly],
  );

  const editorContext = useMemo(
    (): EditorContextValue => ({
      document: documentRef,
      schema: documentRef.root,
      uiSchema: uiSchemaRef,
      updateDocument,
      updateSchema: updateDocument,
      updateUiSchema,
      readonly,
    }),
    [documentRef, readonly, uiSchemaRef, updateDocument, updateUiSchema],
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
    readonly,
  };
}
