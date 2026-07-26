import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import {
  Category,
  Control,
  Group,
  Label,
  Step,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import { isArrayControlScope, readElementLabelProp } from "./array-item-label.js";
import {
  getUiElementAt,
  updateControlOption,
  updateControlScope,
  updateElementI18n,
  updateElementLabel,
  updateLabelText,
  type UiPath,
} from "./ui-editor.js";

export interface UiAttributeField {
  name: string;
  labelKey: string;
}

export interface ListUiAttributeFieldsOptions {
  /** When true, offer the JSON Forms `i18n` prefix field (multilang editor opt-in). */
  includeI18n?: boolean;
}

const I18N_ATTRIBUTE: UiAttributeField = {
  name: "i18n",
  labelKey: "uiAttributes.i18n",
};

const CONTROL_ATTRIBUTES: readonly UiAttributeField[] = [
  { name: "scope", labelKey: "uiAttributes.scope" },
  { name: "label", labelKey: "uiAttributes.label" },
];

const ELEMENT_LABEL_PROP_ATTRIBUTE: UiAttributeField = {
  name: "elementLabelProp",
  labelKey: "uiAttributes.elementLabelProp",
};

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

function withOptionalI18n(
  fields: UiAttributeField[],
  includeI18n: boolean | undefined,
): UiAttributeField[] {
  if (!includeI18n) return fields;
  return [...fields, I18N_ATTRIBUTE];
}

export function listUiAttributeFields(
  element: UiElement,
  document?: SchemaDocument | null,
  options?: ListUiAttributeFieldsOptions,
): UiAttributeField[] {
  if (element instanceof Control) {
    const fields = [...CONTROL_ATTRIBUTES];
    if (isArrayControlScope(document, element.scope)) {
      fields.push(ELEMENT_LABEL_PROP_ATTRIBUTE);
    }
    return withOptionalI18n(fields, options?.includeI18n);
  }
  if (element instanceof Group) {
    return withOptionalI18n([...GROUP_ATTRIBUTES], options?.includeI18n);
  }
  if (element instanceof Category) {
    return withOptionalI18n([...CATEGORY_ATTRIBUTES], options?.includeI18n);
  }
  if (element instanceof Step) {
    return withOptionalI18n([...STEP_ATTRIBUTES], options?.includeI18n);
  }
  if (element instanceof Label) {
    return withOptionalI18n([...LABEL_ATTRIBUTES], options?.includeI18n);
  }
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
    case "i18n":
      return element.i18n ?? "";
    case "elementLabelProp": {
      if (!(element instanceof Control)) return "";
      const prop = readElementLabelProp(element.options);
      return typeof prop === "string" ? prop : (prop?.join(".") ?? "");
    }
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
    case "i18n": {
      const trimmed = typeof value === "string" ? value.trim() : "";
      return updateElementI18n(root, path, trimmed || undefined);
    }
    case "elementLabelProp":
      if (element instanceof Control) {
        const trimmed = typeof value === "string" ? value.trim() : "";
        return updateControlOption(root, path, "elementLabelProp", trimmed || undefined);
      }
      break;
    default:
      break;
  }

  return root;
}
