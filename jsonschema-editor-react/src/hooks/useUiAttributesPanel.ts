import { useCallback, useMemo } from "react";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Group, HorizontalLayout, VerticalLayout } from "@jsonschema-editor/ui-schema";
import {
  changeUiLayoutKind,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  type UiLayoutKind,
  type UiPath,
} from "../utils/ui-editor.js";
import {
  getUiAttributeValue,
  listUiAttributeFields,
  patchUiAttribute,
} from "../utils/ui-attributes.js";
import { useJseI18n } from "../context/JseI18nContext.js";

export interface UiAttributesPanelCallbacks {
  onRootChange: (root: UiElement) => void;
}

export function useUiAttributesPanel(
  root: UiElement,
  selectedPath: UiPath,
  callbacks: UiAttributesPanelCallbacks,
) {
  const { t } = useJseI18n();

  const selectedElement = useMemo(() => {
    try {
      return getUiElementAt(root, selectedPath);
    } catch {
      return root;
    }
  }, [root, selectedPath]);

  const isLayout = isLayoutElement(selectedElement);
  const attributeFields = useMemo(
    () => listUiAttributeFields(selectedElement),
    [selectedElement],
  );

  const layoutKind = useMemo((): UiLayoutKind | null => {
    const element = selectedElement;
    if (element instanceof VerticalLayout) return "VerticalLayout";
    if (element instanceof HorizontalLayout) return "HorizontalLayout";
    if (element instanceof Group) return "Group";
    return null;
  }, [selectedElement]);

  const patch = useCallback(
    (next: UiElement) => {
      callbacks.onRootChange(next);
    },
    [callbacks],
  );

  const readAttribute = useCallback(
    (name: string): unknown => getUiAttributeValue(selectedElement, name),
    [selectedElement],
  );

  const updateAttribute = useCallback(
    (name: string, value: unknown) => {
      patch(patchUiAttribute(root, selectedPath, name, value));
    },
    [patch, root, selectedPath],
  );

  const setLayoutKind = useCallback(
    (kind: UiLayoutKind) => {
      if (!layoutKind) return;
      const groupLabel =
        kind === "Group" && selectedElement instanceof Group
          ? selectedElement.label
          : undefined;
      patch(changeUiLayoutKind(root, selectedPath, kind, groupLabel, t));
    },
    [layoutKind, patch, root, selectedElement, selectedPath, t],
  );

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
