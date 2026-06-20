import { useCallback, useMemo } from "react";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { getValueAtPath, setValueAtPath } from "@jsonschema-editor/json-schema";
import { resolveSchemaAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { scopeToPath } from "@jsonschema-editor/ui-schema";
import { useFormData } from "../context/FormDataContext.js";

export function useScopedField(
  rootSchema: SchemaNode,
  scope: string,
  document?: SchemaDocument,
) {
  const { data, onDataChange } = useFormData();
  const path = useMemo(() => scopeToPath(scope), [scope]);

  const fieldSchema = useMemo(() => {
    const resolveRef = document ? (ref: string) => document.resolveRef(ref) : undefined;
    return resolveSchemaAtScope(rootSchema, scope, resolveRef);
  }, [document, rootSchema, scope]);

  const value = getValueAtPath(data, path);

  const setValue = useCallback(
    (next: unknown) => {
      onDataChange(setValueAtPath(data, path, next));
    },
    [data, onDataChange, path],
  );

  return { path, fieldSchema, value, setValue, formData: data };
}

function normalizeArrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function useArrayFieldValue(scope: string) {
  const { data, onDataChange } = useFormData();
  const path = useMemo(() => scopeToPath(scope), [scope]);

  const items = useMemo(() => normalizeArrayValue(getValueAtPath(data, path)), [data, path]);

  const setItems = useCallback(
    (next: unknown[]) => {
      onDataChange(setValueAtPath(data, path, next));
    },
    [data, onDataChange, path],
  );

  return { items, setItems, path };
}
