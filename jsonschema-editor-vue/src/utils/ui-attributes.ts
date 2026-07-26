import {
  Category,
  Control,
  Group,
  Label,
  Step,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import {
  getUiElementAt,
  updateControlScope,
  updateElementLabel,
  updateLabelText,
  type UiPath,
} from "./ui-editor";

export interface UiAttributeField {
  name: string;
  labelKey: string;
}

const CONTROL_ATTRIBUTES: readonly UiAttributeField[] = [
  { name: "scope", labelKey: "uiAttributes.scope" },
  { name: "label", labelKey: "uiAttributes.label" },
];

const GROUP_ATTRIBUTES: readonly UiAttributeField[] = [
  { name: "label", labelKey: "uiAttributes.groupLabel" },
];

const CATEGORY_ATTRIBUTES: readonly UiAttributeField[] = [
  { name: "label", labelKey: "uiAttributes.categoryLabel" },
];

const STEP_ATTRIBUTES: readonly UiAttributeField[] = [
  { name: "label", labelKey: "uiAttributes.stepLabel" },
];

const LABEL_ATTRIBUTES: readonly UiAttributeField[] = [
  { name: "text", labelKey: "uiAttributes.text" },
];

export function listUiAttributeFields(element: UiElement): UiAttributeField[] {
  if (element instanceof Control) return [...CONTROL_ATTRIBUTES];
  if (element instanceof Group) return [...GROUP_ATTRIBUTES];
  if (element instanceof Category) return [...CATEGORY_ATTRIBUTES];
  if (element instanceof Step) return [...STEP_ATTRIBUTES];
  if (element instanceof Label) return [...LABEL_ATTRIBUTES];
  return [];
}

export function getUiAttributeValue(element: UiElement, name: string): unknown {
  switch (name) {
    case "scope":
      return element instanceof Control ? element.scope : undefined;
    case "label":
      if (element instanceof Control) return element.label ?? "";
      if (element instanceof Group) return element.label ?? "";
      if (element instanceof Category) return element.label ?? "";
      if (element instanceof Step) return element.label ?? "";
      return undefined;
    case "text":
      return element instanceof Label ? element.text : undefined;
    default:
      return element.getCustomAttribute(name);
  }
}

export function patchUiAttribute(
  root: UiElement,
  path: UiPath,
  name: string,
  value: unknown,
): UiElement {
  const element = getUiElementAt(root, path);

  switch (name) {
    case "scope":
      if (element instanceof Control) {
        const trimmed = typeof value === "string" ? value.trim() : "";
        return updateControlScope(root, path, trimmed || "#");
      }
      break;
    case "label":
      if (element instanceof Control) {
        const label = typeof value === "string" ? value.trim() || undefined : undefined;
        return updateControlScope(root, path, element.scope, label);
      }
      if (
        element instanceof Group ||
        element instanceof Category ||
        element instanceof Step
      ) {
        return updateElementLabel(root, path, typeof value === "string" ? value : "");
      }
      break;
    case "text":
      if (element instanceof Label) {
        return updateLabelText(root, path, typeof value === "string" ? value : "");
      }
      break;
    default:
      break;
  }

  return root;
}
