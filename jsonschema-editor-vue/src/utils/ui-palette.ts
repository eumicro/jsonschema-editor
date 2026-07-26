import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import type { TranslateFn } from "../i18n/types.js";
import {
  findControlScopeSuggestion,
  listDetailControlScopeSuggestions,
  listControlScopeSuggestions,
  listUsedControlScopes,
} from "./control-scope-suggestions.js";
import { createUiElement, type UiPath } from "./ui-editor.js";

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
    /** Insert parent path — used for relative scopes inside `options.detail`. */
    parentPath?: UiPath;
  },
): UiElement {
  if (kind !== "Control") {
    return createUiElement(kind, { translate: options.translate });
  }

  const parentPath = options.parentPath ?? [];
  const inDetail =
    parentPath[parentPath.length - 1] === "detail" ||
    findEnclosingDetailPathSafe(parentPath) !== null;

  if (inDetail) {
    const detailRoot =
      parentPath[parentPath.length - 1] === "detail"
        ? parentPath
        : (findEnclosingDetailPathSafe(parentPath) ?? parentPath);
    const used = listUsedControlScopes(options.root, { subtreeRoot: detailRoot });
    const available = listDetailControlScopeSuggestions(
      options.document,
      options.root,
      detailRoot,
      { excludeScopes: used },
    );
    const suggestion = available[0];
    return createUiElement("Control", {
      translate: options.translate,
      scope: suggestion?.scope ?? "#/properties/field",
      label: suggestion?.label,
    });
  }

  const used = listUsedControlScopes(options.root, { skipDetail: true });
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

function findEnclosingDetailPathSafe(path: UiPath): UiPath | null {
  const index = path.lastIndexOf("detail");
  if (index === -1) return null;
  return path.slice(0, index + 1);
}
