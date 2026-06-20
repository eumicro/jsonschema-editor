import { createContext, useContext, type ReactNode } from "react";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

export interface EditorContextValue {
  document: SchemaDocument;
  schema: SchemaNode;
  uiSchema: UiSchema;
  updateDocument: (next: SchemaDocument) => void;
  updateSchema: (next: SchemaDocument) => void;
  updateUiSchema: (next: UiSchema, manual?: boolean) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorContextProvider({
  value,
  children,
}: {
  value: EditorContextValue;
  children: ReactNode;
}) {
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditorContext requires JsonSchemaFormEditor");
  }
  return ctx;
}
