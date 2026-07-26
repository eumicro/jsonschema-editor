import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import { Control, resolveControlDetailSchema, type UiElement } from "@jsonschema-editor/ui-schema";
import {
  collectRequiredControlScopes,
  type RequiredControlScope,
} from "./ui-schema-sync.js";
import {
  findEnclosingDetailPath,
  getUiElementAt,
  isLayoutElement,
  uiPathKey,
  type UiPath,
} from "./ui-editor.js";

export interface ControlScopeSuggestion extends RequiredControlScope {
  /** Anzeige im Dropdown: Label + Scope */
  display: string;
}

export interface ListControlScopeSuggestionsOptions {
  /** Bereits verwendete Control-Scopes (werden ausgeblendet). */
  excludeScopes?: Iterable<string>;
  /** Schema-Knoten als Wurzel (z. B. Array-Item / $defs-Objekt für detail). */
  schema?: SchemaNode;
  /** Basis-Scope für relative Scopes (Standard `#`). */
  baseScope?: string;
}

export interface ListUsedControlScopesOptions {
  /** Dieses Control bei der Belegung ignorieren (z. B. aktuell bearbeitetes Element). */
  ignorePath?: UiPath;
  /** Nur Scopes unter diesem Pfad (z. B. detail-Subtree). */
  subtreeRoot?: UiPath;
  /** Detail-Scopes ausschließen (Top-Level-Vorschläge). */
  skipDetail?: boolean;
}

function toDisplay(entry: RequiredControlScope): ControlScopeSuggestion {
  return {
    ...entry,
    display: entry.label ? `${entry.label} (${entry.scope})` : entry.scope,
  };
}

function collectUsedScopes(
  element: UiElement,
  path: UiPath,
  ignoreKey: string | null,
  scopes: string[],
  skipDetail: boolean,
): void {
  if (ignoreKey !== null && uiPathKey(path) === ignoreKey) {
    // aktuelles Control überspringen
  } else if (element instanceof Control) {
    scopes.push(element.scope);
  }

  if (element instanceof Control && element.detail && !skipDetail) {
    collectUsedScopes(element.detail, [...path, "detail"], ignoreKey, scopes, skipDetail);
  }

  if (!isLayoutElement(element)) return;
  element.elements.forEach((child, index) => {
    collectUsedScopes(child, [...path, index], ignoreKey, scopes, skipDetail);
  });
}

export function listUsedControlScopes(
  root: UiElement | undefined | null,
  options: ListUsedControlScopesOptions = {},
): string[] {
  if (!root) return [];
  const scopes: string[] = [];
  const ignoreKey =
    options.ignorePath === undefined ? null : uiPathKey(options.ignorePath);

  if (options.subtreeRoot) {
    try {
      const subtree = getUiElementAt(root, options.subtreeRoot);
      collectUsedScopes(subtree, options.subtreeRoot, ignoreKey, scopes, false);
    } catch {
      return [];
    }
    return scopes;
  }

  collectUsedScopes(root, [], ignoreKey, scopes, options.skipDetail ?? false);
  return scopes;
}

export function isControlScopeInUse(
  scope: string,
  usedScopes: Iterable<string>,
  keepScope?: string,
): boolean {
  const trimmed = scope.trim();
  if (!trimmed) return false;
  if (keepScope && trimmed === keepScope) return false;
  for (const used of usedScopes) {
    if (used === trimmed) return true;
  }
  return false;
}

export function listControlScopeSuggestions(
  document: SchemaDocument | undefined | null,
  options: ListControlScopeSuggestionsOptions = {},
): ControlScopeSuggestion[] {
  if (!document && !options.schema) return [];
  const resolveRef = document ? (ref: string) => document.resolveRef(ref) : undefined;
  const schema = options.schema ?? document!.root;
  const baseScope = options.baseScope ?? "#";
  const excluded = new Set(options.excludeScopes ?? []);

  return collectRequiredControlScopes(schema, baseScope, resolveRef)
    .filter((entry) => !excluded.has(entry.scope))
    .map(toDisplay);
}

/** Scope-Vorschläge relativ zum detail-Kontext (Array-Items / Objekt / $defs). */
export function listDetailControlScopeSuggestions(
  document: SchemaDocument | undefined | null,
  root: UiElement,
  selectedPath: UiPath,
  options: { excludeScopes?: Iterable<string> } = {},
): ControlScopeSuggestion[] {
  const detailPath = findEnclosingDetailPath(selectedPath);
  if (!detailPath || !document) {
    return listControlScopeSuggestions(document, {
      excludeScopes: options.excludeScopes,
    });
  }

  const controlPath = detailPath.slice(0, -1);
  try {
    const control = getUiElementAt(root, controlPath);
    if (!(control instanceof Control)) {
      return listControlScopeSuggestions(document, { excludeScopes: options.excludeScopes });
    }
    const detailSchema = resolveControlDetailSchema(document, control.scope);
    if (!detailSchema) {
      return listControlScopeSuggestions(document, { excludeScopes: options.excludeScopes });
    }
    return listControlScopeSuggestions(document, {
      schema: detailSchema,
      baseScope: "#",
      excludeScopes: options.excludeScopes,
    });
  } catch {
    return listControlScopeSuggestions(document, { excludeScopes: options.excludeScopes });
  }
}

export function findControlScopeSuggestion(
  suggestions: readonly ControlScopeSuggestion[],
  scope: string,
): ControlScopeSuggestion | undefined {
  return suggestions.find((entry) => entry.scope === scope);
}
