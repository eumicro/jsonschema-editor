import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { controlAllowsDetail, isLayoutElement, type UiPath } from "./ui-editor.js";

export function canAcceptUiChildren(
  element: UiElement,
  document?: SchemaDocument | null,
): boolean {
  if (isLayoutElement(element)) return true;
  return controlAllowsDetail(element, document);
}

export function canDeleteUiElement(path: UiPath): boolean {
  if (path.length === 0) return false;
  if (path[path.length - 1] === "detail") return false;
  return true;
}
