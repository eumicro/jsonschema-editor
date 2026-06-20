import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  CompositionSchema,
  ObjectSchema,
  RefSchema,
} from "@jsonschema-editor/json-schema";
import {
  Control,
  Step,
  VerticalLayout,
  buildPropertyScope,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import { scopePropertyName } from "../registry/form-field-context.js";
import {
  getUiParentPath,
  insertUiElement,
  isLayoutElement,
  type UiPath,
} from "./ui-editor.js";

export interface RequiredControlScope {
  scope: string;
  label: string;
}

function resolveSchemaNode(
  schema: SchemaNode,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): SchemaNode {
  if (!(schema instanceof RefSchema) || !resolveRef) return schema;
  const resolved = resolveRef(schema.ref);
  return resolved ? resolveSchemaNode(resolved, resolveRef) : schema;
}

export function parentScopeOf(scope: string): string {
  const marker = "/properties/";
  const index = scope.lastIndexOf(marker);
  if (index <= 0) return "#";
  return scope.slice(0, index);
}

export function collectControlScopesFromUi(root: UiElement): string[] {
  const scopes: string[] = [];
  walkUi(root, (element) => {
    if (element.elementKind === "Control") {
      scopes.push((element as Control).scope);
    }
  });
  return scopes;
}

function walkUi(element: UiElement, visit: (element: UiElement) => void): void {
  visit(element);
  if (!isLayoutElement(element)) return;
  for (const child of element.elements) {
    walkUi(child, visit);
  }
}

export function collectRequiredControlScopes(
  schema: SchemaNode,
  scope: string,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): RequiredControlScope[] {
  schema = resolveSchemaNode(schema, resolveRef);

  if (schema instanceof ObjectSchema) {
    const scopes: RequiredControlScope[] = [];
    for (const [name, propSchema] of schema.properties) {
      const propScope = buildPropertyScope(scope, name);
      scopes.push(...collectRequiredControlScopes(propSchema, propScope, resolveRef));
    }
    return scopes;
  }

  if (schema instanceof CompositionSchema) {
    if (schema.oneOf.length > 0 || schema.anyOf.length > 0) {
      return [
        {
          scope,
          label: schema.title ?? scopePropertyName(scope) ?? "Feld",
        },
      ];
    }

    const scopes: RequiredControlScope[] = [];
    for (const branch of schema.allOf) {
      scopes.push(...collectRequiredControlScopes(branch, scope, resolveRef));
    }
    return scopes;
  }

  return [
    {
      scope,
      label: schema.title ?? scopePropertyName(scope) ?? "Feld",
    },
  ];
}

function findControlPathByScope(root: UiElement, scope: string, path: UiPath = []): UiPath | null {
  if (root.elementKind === "Control" && (root as Control).scope === scope) {
    return path;
  }
  if (!isLayoutElement(root)) return null;

  for (let index = 0; index < root.elements.length; index += 1) {
    const found = findControlPathByScope(root.elements[index], scope, [...path, index]);
    if (found) return found;
  }

  return null;
}

function findControlsWithParentScope(root: UiElement, parentScope: string): Control[] {
  const controls: Control[] = [];
  walkUi(root, (element) => {
    if (element.elementKind !== "Control") return;
    const control = element as Control;
    if (parentScopeOf(control.scope) === parentScope) {
      controls.push(control);
    }
  });
  return controls.sort((a, b) => a.scope.localeCompare(b.scope));
}

function insertControlAtDefaultLocation(
  root: UiElement,
  parentScope: string,
  scope: string,
  label: string,
): UiElement {
  if (parentScope === "#") {
    if (root.elementKind === "Stepper") {
      const step = new Step(label);
      const layout = new VerticalLayout();
      layout.addChild(new Control(scope, label));
      step.addChild(layout);
      return insertUiElement(root, [], step);
    }

    if (isLayoutElement(root)) {
      return insertUiElement(root, [], new Control(scope, label));
    }
  }

  const parentControlPath = findControlPathByScope(root, parentScope);
  if (parentControlPath) {
    const layoutPath = getUiParentPath(parentControlPath);
    return insertUiElement(root, layoutPath, new Control(scope, label));
  }

  if (isLayoutElement(root)) {
    return insertUiElement(root, [], new Control(scope, label));
  }

  return root;
}

export function insertControlForScope(
  root: UiElement,
  scope: string,
  label: string,
): UiElement {
  const parentScope = parentScopeOf(scope);
  const siblings = findControlsWithParentScope(root, parentScope);

  if (siblings.length > 0) {
    const lastSibling = siblings[siblings.length - 1];
    const controlPath = findControlPathByScope(root, lastSibling.scope);
    if (controlPath) {
      const parentPath = getUiParentPath(controlPath);
      const insertIndex = controlPath[controlPath.length - 1] + 1;
      return insertUiElement(root, parentPath, new Control(scope, label), insertIndex);
    }
  }

  return insertControlAtDefaultLocation(root, parentScope, scope, label);
}

export function syncUiSchemaWithSchema(document: SchemaDocument, uiRoot: UiElement): UiElement {
  const resolveRef = (ref: string) => document.resolveRef(ref);
  const required = collectRequiredControlScopes(document.root, "#", resolveRef);
  const existing = new Set(collectControlScopesFromUi(uiRoot));

  let next = uiRoot;
  for (const entry of required) {
    if (existing.has(entry.scope)) continue;
    next = insertControlForScope(next, entry.scope, entry.label);
    existing.add(entry.scope);
  }

  return next;
}
