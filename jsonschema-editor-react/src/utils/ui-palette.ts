import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import type { TranslateFn } from "../i18n/types.js";
import {
  findControlScopeSuggestion,
  listControlScopeSuggestions,
  listUsedControlScopes,
} from "./control-scope-suggestions.js";
import { createUiElement } from "./ui-editor.js";

export type UiPaletteKind =
  | "Control"
  | "Group"
  | "VerticalLayout"
  | "HorizontalLayout"
  | "Label"
  | "Categorization"
  | "Category"
  | "Stepper"
  | "Step";

export const UI_PALETTE_KINDS: readonly UiPaletteKind[] = [
  "VerticalLayout",
  "HorizontalLayout",
  "Group",
  "Label",
  "Categorization",
  "Category",
  "Stepper",
  "Step",
  "Control",
];

export function createPaletteUiElement(
  kind: UiPaletteKind,
  options: {
    root: UiElement;
    document?: SchemaDocument | null;
    translate: TranslateFn;
  },
): UiElement {
  if (kind !== "Control") {
    return createUiElement(kind, { translate: options.translate });
  }

  const used = listUsedControlScopes(options.root);
  const available = listControlScopeSuggestions(options.document, {
    excludeScopes: used,
  });
  const suggestion = available[0];
  const all = listControlScopeSuggestions(options.document);
  const matched = suggestion
    ? findControlScopeSuggestion(all, suggestion.scope)
    : undefined;

  return createUiElement("Control", {
    translate: options.translate,
    scope: suggestion?.scope ?? "#/properties/field",
    label: matched?.label ?? suggestion?.label,
  });
}
