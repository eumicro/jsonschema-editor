import { computed, type Ref } from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Group, HorizontalLayout, Label, VerticalLayout } from "@jsonschema-editor/ui-schema";
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
import type { JseLocale } from "../i18n/types.js";
import { useJseI18n } from "./useJseI18n";

export interface UiAttributesPanelEmits {
  (event: "update:root", root: UiElement): void;
}

export function useUiAttributesPanel(
  root: Ref<UiElement>,
  selectedPath: Ref<UiPath>,
  emit: UiAttributesPanelEmits,
  document?: Ref<SchemaDocument | null | undefined>,
  labelLocales?: Ref<readonly JseLocale[] | undefined>,
) {
  const { t } = useJseI18n();

  const multilangEnabled = computed(
    () => (labelLocales?.value?.length ?? 0) > 0,
  );

  const selectedElement = computed(() => {
    try {
      return getUiElementAt(root.value, selectedPath.value);
    } catch {
      return root.value;
    }
  });

  const isLayout = computed(() => isLayoutElement(selectedElement.value));
  const attributeFields = computed(() =>
    listUiAttributeFields(selectedElement.value, document?.value, {
      includeI18n: multilangEnabled.value,
    }),
  );

  const i18nSuffix = computed(() =>
    selectedElement.value instanceof Label ? ("text" as const) : ("label" as const),
  );

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
    patch(changeUiLayoutKind(root.value, selectedPath.value, kind, groupLabel, t));
  }

  return {
    selectedElement,
    isLayout,
    layoutKind,
    attributeFields,
    multilangEnabled,
    i18nSuffix,
    readAttribute,
    updateAttribute,
    setLayoutKind,
    getUiElementLabel,
  };
}
