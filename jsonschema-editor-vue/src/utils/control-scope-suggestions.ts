import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { Control, type UiElement } from "@jsonschema-editor/ui-schema";
import {
  collectRequiredControlScopes,
  type RequiredControlScope,
} from "./ui-schema-sync.js";
import { isLayoutElement, uiPathKey, type UiPath } from "./ui-editor.js";

export interface ControlScopeSuggestion extends RequiredControlScope {
  /** Anzeige im Dropdown: Label + Scope */
  display: string;
}

export interface ListControlScopeSuggestionsOptions {
  /** Bereits verwendete Control-Scopes (werden ausgeblendet). */
  excludeScopes?: Iterable<string>;
}

export interface ListUsedControlScopesOptions {
  /** Dieses Control bei der Belegung ignorieren (z. B. aktuell bearbeitetes Element). */
  ignorePath?: UiPath;
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
): void {
  if (ignoreKey !== null && uiPathKey(path) === ignoreKey) {
    // aktuelles Control überspringen, Kinder gibt es bei Control nicht
  } else if (element instanceof Control) {
    scopes.push(element.scope);
  }

  if (!isLayoutElement(element)) return;
  element.elements.forEach((child, index) => {
    collectUsedScopes(child, [...path, index], ignoreKey, scopes);
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
  collectUsedScopes(root, [], ignoreKey, scopes);
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
  if (!document) return [];
  const resolveRef = (ref: string) => document.resolveRef(ref);
  const excluded = new Set(options.excludeScopes ?? []);

  return collectRequiredControlScopes(document.root, "#", resolveRef)
    .filter((entry) => !excluded.has(entry.scope))
    .map(toDisplay);
}

export function findControlScopeSuggestion(
  suggestions: readonly ControlScopeSuggestion[],
  scope: string,
): ControlScopeSuggestion | undefined {
  return suggestions.find((entry) => entry.scope === scope);
}
