import type { UiElement } from "@jsonschema-editor/ui-schema";
import { isLayoutElement, type UiPath } from "./ui-editor.js";

export function canAcceptUiChildren(element: UiElement): boolean {
  return isLayoutElement(element);
}

export function canDeleteUiElement(path: UiPath): boolean {
  return path.length > 0;
}
