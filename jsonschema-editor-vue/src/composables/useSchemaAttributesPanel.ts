import { computed, ref, watch, type Ref } from "vue";
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
} from "../utils/schema-document";
import {
  getArrayItemsKind,
  resolveSchemaDisplayKind,
  type SchemaPath,
} from "../utils/schema-editor";
import {
  getSchemaAttributeValue,
  listSchemaAttributeFields,
  patchSchemaAttribute,
} from "../utils/schema-attributes";
import { useJseI18n } from "./useJseI18n";

export interface SchemaAttributesPanelEmits {
  (event: "update:document", document: SchemaDocument): void;
  (event: "update:selectedPath", path: SchemaPath): void;
}

export function useSchemaAttributesPanel(
  document: Ref<SchemaDocument>,
  selectedPath: Ref<SchemaPath>,
  emit: SchemaAttributesPanelEmits,
) {
  const { t } = useJseI18n();
  const propertyNameInput = ref("");
  const propertyNameError = ref("");
  const selectedDefRef = ref("");

  const selectedNode = computed(() => {
    try {
      return getNodeAtPath(document.value, selectedPath.value);
    } catch {
      return document.value.root;
    }
  });

  const isRefNode = computed(() => selectedNode.value instanceof RefSchema);
  const isDefRoot = computed(() => isDefRootPath(selectedPath.value));
  const availableDefs = computed(() => document.value.listDefNames());

  const parentObject = computed(() => {
    const parentPath = getPropertyParentPathInDocument(selectedPath.value);
    if (!parentPath) return null;
    try {
      const parent = getNodeAtPath(document.value, parentPath);
      return parent instanceof ObjectSchema ? parent : null;
    } catch {
      return null;
    }
  });

  const propertyName = computed(() => {
    if (isDefRoot.value) return selectedPath.value[1] ?? null;
    if (!selectedPath.value.length) return null;
    const last = selectedPath.value[selectedPath.value.length - 1];
    if (last === "items" || last === "allOf" || last === "anyOf" || last === "oneOf") return null;
    if (/^\d+$/.test(last)) return null;
    return last;
  });

  const showPropertyName = computed(
    () => (!!parentObject.value && !!propertyName.value) || isDefRoot.value,
  );

  const attributeFields = computed(() => listSchemaAttributeFields(selectedNode.value));

  const isRequired = computed(() => {
    if (!parentObject.value || !propertyName.value || isDefRoot.value) return false;
    return parentObject.value.isPropertyRequired(propertyName.value);
  });

  const isItemsNode = computed(
    () => selectedPath.value[selectedPath.value.length - 1] === "items",
  );

  const showItemsTypeControl = computed(
    () => selectedNode.value instanceof ArraySchema || isItemsNode.value,
  );

  const itemsTypeKind = computed(() => {
    if (selectedNode.value instanceof ArraySchema) {
      return getArrayItemsKind(selectedNode.value);
    }
    if (isItemsNode.value) return resolveSchemaDisplayKind(selectedNode.value);
    return undefined;
  });

  watch(
    [propertyName, selectedNode],
    ([name, node]) => {
      propertyNameInput.value = name ?? "";
      propertyNameError.value = "";
      if (node instanceof RefSchema) {
        selectedDefRef.value =
          availableDefs.value.find((def) => node.ref.includes(`/${def}`)) ??
          availableDefs.value[0] ??
          "";
      }
    },
    { immediate: true },
  );

  function commitPropertyRename() {
    if (isDefRoot.value && propertyName.value) {
      const trimmed = propertyNameInput.value.trim();
      if (!trimmed) {
        propertyNameInput.value = propertyName.value;
        propertyNameError.value = t("validation.nameEmpty");
        return;
      }
      if (trimmed === propertyName.value) {
        propertyNameError.value = "";
        return;
      }
      const next = renameDefinition(document.value, propertyName.value, trimmed);
      if (next === document.value) {
        propertyNameError.value = t("validation.defNameExists", { name: trimmed });
        return;
      }
      propertyNameError.value = "";
      emit("update:document", next);
      emit("update:selectedPath", ["$defs", trimmed]);
      return;
    }

    if (!parentObject.value || !propertyName.value) return;

    const parentPath = getPropertyParentPathInDocument(selectedPath.value);
    if (!parentPath) return;

    const trimmed = propertyNameInput.value.trim();
    if (!trimmed) {
      propertyNameInput.value = propertyName.value;
      propertyNameError.value = t("validation.fieldNameEmpty");
      return;
    }
    if (trimmed === propertyName.value) {
      propertyNameError.value = "";
      return;
    }
    if (parentObject.value.getProperty(trimmed)) {
      propertyNameError.value = t("validation.propertyNameExists", { name: trimmed });
      return;
    }

    const next = renamePropertyInDocument(
      document.value,
      parentPath,
      propertyName.value,
      trimmed,
    );
    if (next === document.value) {
      propertyNameError.value = t("validation.propertyNameExists", { name: trimmed });
      return;
    }

    propertyNameError.value = "";
    emit("update:document", next);
    emit("update:selectedPath", [...parentPath, trimmed]);
  }

  function readAttribute(name: string): unknown {
    return getSchemaAttributeValue(selectedNode.value, name);
  }

  function updateAttribute(name: string, value: unknown) {
    if (!isValidDocumentPath(document.value, selectedPath.value)) return;
    emit(
      "update:document",
      patchSchemaAttribute(document.value, selectedPath.value, name, value),
    );
  }

  function setRequired(required: boolean) {
    if (selectedPath.value.length === 0 || isDefRoot.value) return;
    emit(
      "update:document",
      setPropertyRequiredInDocument(document.value, selectedPath.value, required),
    );
  }

  function commitRefChange() {
    if (!selectedDefRef.value) return;
    emit(
      "update:document",
      setPropertyRefInDocument(document.value, selectedPath.value, selectedDefRef.value),
    );
  }

  function setItemsType(kind: string) {
    if (selectedNode.value instanceof ArraySchema) {
      emit(
        "update:document",
        setArrayItemsInDocument(document.value, selectedPath.value, kind),
      );
      return;
    }
    if (isItemsNode.value) {
      emit(
        "update:document",
        setPropertyKindInDocument(document.value, selectedPath.value, kind),
      );
    }
  }

  return {
    propertyNameInput,
    propertyNameError,
    selectedDefRef,
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
    commitPropertyRename,
    readAttribute,
    updateAttribute,
    setRequired,
    commitRefChange,
    setItemsType,
  };
}
