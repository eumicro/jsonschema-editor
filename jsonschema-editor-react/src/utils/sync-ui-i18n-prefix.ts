import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import {
  Control,
  deriveUiI18nPrefix,
  slugifySchemaTitle,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import { getUiElementAt, updateElementI18n, type UiPath } from "./ui-editor.js";
import {
  relocateUiLabelMessages,
  type UiLabelMessages,
} from "./ui-label-messages.js";

export function syncUiI18nPrefix(
  root: UiElement,
  path: UiPath,
  document: SchemaDocument | null | undefined,
  messages: UiLabelMessages | undefined,
): { root: UiElement; messages: UiLabelMessages | undefined; changed: boolean } {
  let element: UiElement;
  try {
    element = getUiElementAt(root, path);
  } catch {
    return { root, messages, changed: false };
  }

  const derived = deriveUiI18nPrefix(
    slugifySchemaTitle(document?.root.title),
    {
      elementKind: element.elementKind,
      scope: element instanceof Control ? element.scope : undefined,
    },
    path,
  );
  const current = String(element.i18n ?? "").trim();
  if (current === derived) {
    return { root, messages, changed: false };
  }

  const nextRoot = updateElementI18n(root, path, derived);
  const nextMessages = current
    ? relocateUiLabelMessages(messages, current, derived)
    : messages;
  return { root: nextRoot, messages: nextMessages, changed: true };
}
