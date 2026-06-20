import { useCallback, useEffect, useMemo, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { ArraySchema, ObjectSchema, RefSchema } from "@jsonschema-editor/json-schema";
import {
  getNodeAtPath,
  getPropertyParentPathInDocument,
  isDefRootPath,
  isValidDocumentPath,
  renameDefinition,
  renamePropertyInDocument,
  setArrayItemsInDocument,
  setPropertyKindInDocument,
  setPropertyRefInDocument,
  setPropertyRequiredInDocument,
  applyFieldAttributeToDescendants,
} from "../utils/schema-document.js";
import {
  getArrayItemsKind,
  resolveSchemaDisplayKind,
  type SchemaPath,
} from "../utils/schema-editor.js";
import {
  getSchemaAttributeValue,
  listSchemaAttributeFields,
  patchSchemaAttribute,
} from "../utils/schema-attributes.js";
import { useJseI18n } from "../context/JseI18nContext.js";

export interface SchemaAttributesPanelCallbacks {
  onDocumentChange: (document: SchemaDocument) => void;
  onSelectedPathChange: (path: SchemaPath) => void;
}

export function useSchemaAttributesPanel(
  document: SchemaDocument,
  selectedPath: SchemaPath,
  callbacks: SchemaAttributesPanelCallbacks,
) {
  const { t } = useJseI18n();
  const [propertyNameInput, setPropertyNameInput] = useState("");
  const [propertyNameError, setPropertyNameError] = useState("");
  const [selectedDefRef, setSelectedDefRef] = useState("");

  const selectedNode = useMemo(() => {
    try {
      return getNodeAtPath(document, selectedPath);
    } catch {
      return document.root;
    }
  }, [document, selectedPath]);

  const isRefNode = selectedNode instanceof RefSchema;
  const isDefRoot = isDefRootPath(selectedPath);
  const availableDefs = useMemo(() => document.listDefNames(), [document]);

  const parentObject = useMemo(() => {
    const parentPath = getPropertyParentPathInDocument(selectedPath);
    if (!parentPath) return null;
    try {
      const parent = getNodeAtPath(document, parentPath);
      return parent instanceof ObjectSchema ? parent : null;
    } catch {
      return null;
    }
  }, [document, selectedPath]);

  const propertyName = useMemo(() => {
    if (isDefRoot) return selectedPath[1] ?? null;
    if (!selectedPath.length) return null;
    const last = selectedPath[selectedPath.length - 1];
    if (last === "items" || last === "allOf" || last === "anyOf" || last === "oneOf") return null;
    if (/^\d+$/.test(last)) return null;
    return last;
  }, [isDefRoot, selectedPath]);

  const showPropertyName = (!!parentObject && !!propertyName) || isDefRoot;
  const attributeFields = useMemo(
    () => listSchemaAttributeFields(selectedNode),
    [selectedNode],
  );

  const isRequired = useMemo(() => {
    if (!parentObject || !propertyName || isDefRoot) return false;
    return parentObject.isPropertyRequired(propertyName);
  }, [isDefRoot, parentObject, propertyName]);

  const isItemsNode = selectedPath[selectedPath.length - 1] === "items";
  const showItemsTypeControl =
    selectedNode instanceof ArraySchema || isItemsNode;

  const showBulkFieldActions =
    selectedNode instanceof ObjectSchema && selectedNode.propertyCount > 0;

  const itemsTypeKind = useMemo(() => {
    if (selectedNode instanceof ArraySchema) {
      return getArrayItemsKind(selectedNode);
    }
    if (isItemsNode) return resolveSchemaDisplayKind(selectedNode);
    return undefined;
  }, [isItemsNode, selectedNode]);

  useEffect(() => {
    setPropertyNameInput(propertyName ?? "");
    setPropertyNameError("");
    if (selectedNode instanceof RefSchema) {
      setSelectedDefRef(
        availableDefs.find((def) => selectedNode.ref.includes(`/${def}`)) ??
          availableDefs[0] ??
          "",
      );
    }
  }, [availableDefs, propertyName, selectedNode]);

  const commitPropertyRename = useCallback(() => {
    if (isDefRoot && propertyName) {
      const trimmed = propertyNameInput.trim();
      if (!trimmed) {
        setPropertyNameInput(propertyName);
        setPropertyNameError(t("validation.nameEmpty"));
        return;
      }
      if (trimmed === propertyName) {
        setPropertyNameError("");
        return;
      }
      const next = renameDefinition(document, propertyName, trimmed);
      if (next === document) {
        setPropertyNameError(t("validation.defNameExists", { name: trimmed }));
        return;
      }
      setPropertyNameError("");
      callbacks.onDocumentChange(next);
      callbacks.onSelectedPathChange(["$defs", trimmed]);
      return;
    }

    if (!parentObject || !propertyName) return;

    const parentPath = getPropertyParentPathInDocument(selectedPath);
    if (!parentPath) return;

    const trimmed = propertyNameInput.trim();
    if (!trimmed) {
      setPropertyNameInput(propertyName);
      setPropertyNameError(t("validation.fieldNameEmpty"));
      return;
    }
    if (trimmed === propertyName) {
      setPropertyNameError("");
      return;
    }
    if (parentObject.getProperty(trimmed)) {
      setPropertyNameError(t("validation.propertyNameExists", { name: trimmed }));
      return;
    }

    const next = renamePropertyInDocument(document, parentPath, propertyName, trimmed);
    if (next === document) {
      setPropertyNameError(t("validation.propertyNameExists", { name: trimmed }));
      return;
    }

    setPropertyNameError("");
    callbacks.onDocumentChange(next);
    callbacks.onSelectedPathChange([...parentPath, trimmed]);
  }, [
    callbacks,
    document,
    isDefRoot,
    parentObject,
    propertyName,
    propertyNameInput,
    selectedPath,
    t,
  ]);

  const readAttribute = useCallback(
    (name: string): unknown => getSchemaAttributeValue(selectedNode, name),
    [selectedNode],
  );

  const updateAttribute = useCallback(
    (name: string, value: unknown) => {
      if (!isValidDocumentPath(document, selectedPath)) return;
      callbacks.onDocumentChange(
        patchSchemaAttribute(document, selectedPath, name, value),
      );
    },
    [callbacks, document, selectedPath],
  );

  const setRequired = useCallback(
    (required: boolean) => {
      if (selectedPath.length === 0 || isDefRoot) return;
      callbacks.onDocumentChange(
        setPropertyRequiredInDocument(document, selectedPath, required),
      );
    },
    [callbacks, document, isDefRoot, selectedPath],
  );

  const commitRefChange = useCallback(() => {
    if (!selectedDefRef) return;
    callbacks.onDocumentChange(
      setPropertyRefInDocument(document, selectedPath, selectedDefRef),
    );
  }, [callbacks, document, selectedDefRef, selectedPath]);

  const setItemsType = useCallback(
    (kind: string) => {
      if (selectedNode instanceof ArraySchema) {
        callbacks.onDocumentChange(
          setArrayItemsInDocument(document, selectedPath, kind),
        );
        return;
      }
      if (isItemsNode) {
        callbacks.onDocumentChange(
          setPropertyKindInDocument(document, selectedPath, kind),
        );
      }
    },
    [callbacks, document, isItemsNode, selectedNode, selectedPath],
  );

  const applyBulkFieldAttribute = useCallback(
    (attributeName: string, value: boolean) => {
      if (!isValidDocumentPath(document, selectedPath)) return;
      callbacks.onDocumentChange(
        applyFieldAttributeToDescendants(document, selectedPath, attributeName, value),
      );
    },
    [callbacks, document, selectedPath],
  );

  return {
    propertyNameInput,
    setPropertyNameInput,
    propertyNameError,
    setPropertyNameError,
    selectedDefRef,
    setSelectedDefRef,
    selectedNode,
    isRefNode,
    isDefRoot,
    availableDefs,
    parentObject,
    propertyName,
    showPropertyName,
    attributeFields,
    isRequired,
    showItemsTypeControl,
    itemsTypeKind,
    showBulkFieldActions,
    commitPropertyRename,
    readAttribute,
    updateAttribute,
    setRequired,
    commitRefChange,
    setItemsType,
    applyBulkFieldAttribute,
  };
}
