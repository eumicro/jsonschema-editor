import { computed, type Ref } from "vue";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Group, HorizontalLayout, VerticalLayout } from "@jsonschema-editor/ui-schema";
import {
  changeUiLayoutKind,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  type UiLayoutKind,
  type UiPath,
} from "../utils/ui-editor";
import {
  getUiAttributeValue,
  listUiAttributeFields,
  patchUiAttribute,
} from "../utils/ui-attributes";

export interface UiAttributesPanelEmits {
  (event: "update:root", root: UiElement): void;
}

export function useUiAttributesPanel(
  root: Ref<UiElement>,
  selectedPath: Ref<UiPath>,
  emit: UiAttributesPanelEmits,
) {
  const selectedElement = computed(() => {
    try {
      return getUiElementAt(root.value, selectedPath.value);
    } catch {
      return root.value;
    }
  });

  const isLayout = computed(() => isLayoutElement(selectedElement.value));
  const attributeFields = computed(() => listUiAttributeFields(selectedElement.value));

  const layoutKind = computed((): UiLayoutKind | null => {
    const element = selectedElement.value;
    if (element instanceof VerticalLayout) return "VerticalLayout";
    if (element instanceof HorizontalLayout) return "HorizontalLayout";
    if (element instanceof Group) return "Group";
    return null;
  });

  function patch(next: UiElement) {
    emit("update:root", next);
  }

  function readAttribute(name: string): unknown {
    return getUiAttributeValue(selectedElement.value, name);
  }

  function updateAttribute(name: string, value: unknown) {
    patch(patchUiAttribute(root.value, selectedPath.value, name, value));
  }

  function setLayoutKind(kind: UiLayoutKind) {
    if (!layoutKind.value) return;
    const groupLabel =
      kind === "Group" && selectedElement.value instanceof Group
        ? selectedElement.value.label
        : undefined;
    patch(changeUiLayoutKind(root.value, selectedPath.value, kind, groupLabel));
  }

  return {
    selectedElement,
    isLayout,
    layoutKind,
    attributeFields,
    readAttribute,
    updateAttribute,
    setLayoutKind,
    getUiElementLabel,
  };
}
