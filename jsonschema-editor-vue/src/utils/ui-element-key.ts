import type { UiElement } from "@jsonschema-editor/ui-schema";

/** Stable Vue key when switching tabs/steps reuses the same child indices. */
export function buildUiElementKey(prefix: string, element: UiElement, index: number): string {
  if (element.elementKind === "Control") {
    const scope = (element as { scope?: string }).scope;
    if (scope) return `${prefix}#${scope}`;
  }
  return `${prefix}#${element.elementKind}#${index}`;
}
