import {
  Category,
  Categorization,
  Control,
  Group,
  HorizontalLayout,
  Label,
  Step,
  Stepper,
  VerticalLayout,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import { buildPropertyScope } from "@jsonschema-editor/ui-schema";
import { createTranslator } from "../i18n/createTranslator.js";
import type { TranslateFn } from "../i18n/types.js";

const defaultTranslate = createTranslator().t;

export type UiPath = number[];

export function uiPathKey(path: UiPath): string {
  return path.length ? path.join(".") : "root";
}

export function parseUiPathKey(key: string): UiPath {
  if (!key || key === "root") return [];
  return key.split(".").map((segment) => Number.parseInt(segment, 10));
}

export function isLayoutElement(
  element: UiElement,
): element is VerticalLayout | HorizontalLayout | Group | Categorization | Category | Stepper | Step {
  return (
    element instanceof VerticalLayout ||
    element instanceof HorizontalLayout ||
    element instanceof Group ||
    element instanceof Categorization ||
    element instanceof Category ||
    element instanceof Stepper ||
    element instanceof Step
  );
}

export function getUiElementLabel(element: UiElement): string {
  if (element instanceof Control) return element.label ?? element.scope;
  if (element instanceof Group) return element.label ?? "Group";
  if (element instanceof Category) return element.label ?? "Category";
  if (element instanceof Step) return element.label ?? "Step";
  if (element instanceof Label) return element.text;
  if (element instanceof Categorization) return "Categorization";
  if (element instanceof Stepper) return "Stepper";
  return element.elementKind;
}

export function getUiElementAt(root: UiElement, path: UiPath): UiElement {
  let current = root;
  for (const index of path) {
    if (!isLayoutElement(current)) {
      throw new Error("Kein Layout");
    }
    const child = current.getChild(index);
    if (!child) throw new Error(`Kind an Index ${index} fehlt`);
    current = child;
  }
  return current;
}

export function getUiParentPath(path: UiPath): UiPath {
  return path.slice(0, -1);
}

function replaceUiAtPath(root: UiElement, path: UiPath, replacement: UiElement): UiElement {
  if (path.length === 0) return replacement.clone();

  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  const parent = getUiElementAt(root, parentPath);
  if (!isLayoutElement(parent)) throw new Error("Eltern ist kein Layout");

  const parentClone = parent.clone();
  if (!isLayoutElement(parentClone)) throw new Error("Eltern ist kein Layout");
  const relativeTail = path.slice(parentPath.length + 1);

  if (relativeTail.length === 0) {
    parentClone.setChild(index, replacement.clone());
  } else {
    const child = parentClone.getChild(index);
    if (!child) throw new Error(`Kind an Index ${index} fehlt`);
    parentClone.setChild(index, replaceUiAtPath(child, relativeTail, replacement));
  }

  return replaceUiAtPath(root, parentPath, parentClone);
}

export function insertUiElement(
  root: UiElement,
  parentPath: UiPath,
  element: UiElement,
  index?: number,
): UiElement {
  const parent = getUiElementAt(root, parentPath);
  if (!isLayoutElement(parent)) throw new Error("Eltern ist kein Layout");

  const parentClone = parent.clone();
  if (!isLayoutElement(parentClone)) throw new Error("Eltern ist kein Layout");
  parentClone.insertChild(index ?? parentClone.elements.length, element.clone());
  return replaceUiAtPath(root, parentPath, parentClone);
}

export function removeUiElement(root: UiElement, path: UiPath): UiElement {
  if (path.length === 0) return root;

  const parentPath = getUiParentPath(path);
  const parent = getUiElementAt(root, parentPath);
  if (!isLayoutElement(parent)) throw new Error("Eltern ist kein Layout");

  const parentClone = parent.clone();
  if (!isLayoutElement(parentClone)) throw new Error("Eltern ist kein Layout");
  parentClone.removeChild(path[path.length - 1]);
  return replaceUiAtPath(root, parentPath, parentClone);
}

export function moveUiElement(root: UiElement, from: UiPath, to: UiPath): UiElement {
  const fromParentPath = getUiParentPath(from);
  const toParentPath = getUiParentPath(to);

  if (uiPathKey(fromParentPath) !== uiPathKey(toParentPath)) {
    return root;
  }

  const parent = getUiElementAt(root, fromParentPath);
  if (!isLayoutElement(parent)) return root;

  const parentClone = parent.clone();
  if (!isLayoutElement(parentClone)) return root;
  parentClone.moveChild(from[from.length - 1], to[to.length - 1]);
  return replaceUiAtPath(root, fromParentPath, parentClone);
}

export function isAncestorPath(ancestor: UiPath, descendant: UiPath): boolean {
  if (ancestor.length >= descendant.length) return false;
  return ancestor.every((segment, index) => segment === descendant[index]);
}

export function isSameOrAncestorPath(ancestor: UiPath, path: UiPath): boolean {
  if (uiPathKey(ancestor) === uiPathKey(path)) return true;
  return isAncestorPath(ancestor, path);
}

export function canAcceptUiChild(parent: UiElement, child: UiElement): boolean {
  if (!isLayoutElement(parent)) return false;
  try {
    const clone = parent.clone();
    if (!isLayoutElement(clone)) return false;
    clone.insertChild(clone.elements.length, child.clone());
    return true;
  } catch {
    return false;
  }
}

export function canMoveUiElementTo(
  root: UiElement,
  from: UiPath,
  toParent: UiPath,
  toIndex: number,
): boolean {
  if (from.length === 0) return false;
  if (isSameOrAncestorPath(from, toParent)) return false;

  try {
    const element = getUiElementAt(root, from);
    const targetParent = getUiElementAt(root, toParent);
    if (!canAcceptUiChild(targetParent, element)) return false;

    const fromParent = getUiParentPath(from);
    if (uiPathKey(fromParent) === uiPathKey(toParent)) {
      const fromIndex = from[from.length - 1];
      const maxIndex = isLayoutElement(targetParent) ? targetParent.elements.length : 0;
      const insertIndex = Math.max(0, Math.min(toIndex, maxIndex));
      if (insertIndex === fromIndex || insertIndex === fromIndex + 1) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function adjustUiPathAfterRemoval(path: UiPath, removed: UiPath): UiPath {
  if (removed.length === 0) return path;

  const removedParent = removed.slice(0, -1);
  const removedIndex = removed[removed.length - 1];

  if (path.length < removedParent.length) return path;
  for (let index = 0; index < removedParent.length; index += 1) {
    if (path[index] !== removedParent[index]) return path;
  }

  const next = [...path];
  const affectedIndex = next[removedParent.length];
  if (affectedIndex !== undefined && affectedIndex > removedIndex) {
    next[removedParent.length] = affectedIndex - 1;
  }
  return next;
}

export function moveUiElementTo(
  root: UiElement,
  from: UiPath,
  toParent: UiPath,
  toIndex: number,
): UiElement {
  if (!canMoveUiElementTo(root, from, toParent, toIndex)) return root;

  const element = getUiElementAt(root, from).clone();
  let next = removeUiElement(root, from);

  const adjustedParent = adjustUiPathAfterRemoval(toParent, from);
  const targetParent = getUiElementAt(next, adjustedParent);
  const maxIndex = isLayoutElement(targetParent) ? targetParent.elements.length : 0;
  let insertIndex = Math.max(0, Math.min(toIndex, maxIndex));

  const fromParent = getUiParentPath(from);
  const fromIndex = from[from.length - 1];
  if (uiPathKey(fromParent) === uiPathKey(adjustedParent) && fromIndex < insertIndex) {
    insertIndex -= 1;
  }

  return insertUiElement(next, adjustedParent, element, insertIndex);
}

export function createUiElement(
  kind:
    | "Control"
    | "Group"
    | "VerticalLayout"
    | "HorizontalLayout"
    | "Label"
    | "Categorization"
    | "Category"
    | "Stepper"
    | "Step",
  options?: { scope?: string; label?: string; text?: string; translate?: TranslateFn },
): UiElement {
  const t = options?.translate ?? defaultTranslate;
  switch (kind) {
    case "Control":
      return new Control(
        options?.scope ?? "#/properties/field",
        options?.label ?? t("uiDefaults.controlLabel"),
      );
    case "Group":
      return new Group(options?.label ?? t("uiDefaults.groupLabel"));
    case "HorizontalLayout":
      return new HorizontalLayout();
    case "Label":
      return new Label(options?.text ?? t("uiDefaults.labelText"));
    case "Categorization":
      return new Categorization();
    case "Category":
      return new Category(options?.label ?? t("uiDefaults.categoryLabel"));
    case "Stepper":
      return new Stepper();
    case "Step":
      return new Step(options?.label ?? t("uiDefaults.stepLabel"));
    default:
      return new VerticalLayout();
  }
}

export function updateControlScope(root: UiElement, path: UiPath, scope: string, label?: string): UiElement {
  const control = getUiElementAt(root, path);
  if (!(control instanceof Control)) return root;
  const next = control.clone() as Control;
  next.scope = scope;
  if (label !== undefined) next.label = label;
  return replaceUiAtPath(root, path, next);
}

export type UiLayoutKind = "VerticalLayout" | "HorizontalLayout" | "Group";

export function changeUiLayoutKind(
  root: UiElement,
  path: UiPath,
  kind: UiLayoutKind,
  groupLabel?: string,
  translate?: TranslateFn,
): UiElement {
  const element = getUiElementAt(root, path);
  if (!isLayoutElement(element)) return root;

  const replacement = createUiElement(
    kind,
    kind === "Group"
      ? {
          label: groupLabel ?? (element instanceof Group ? element.label : undefined),
          translate,
        }
      : { translate },
  );

  for (const child of element.elements) {
    if (isLayoutElement(replacement)) {
      replacement.addChild(child.clone());
    }
  }

  return replaceUiAtPath(root, path, replacement);
}

export function updateGroupLabel(root: UiElement, path: UiPath, label: string): UiElement {
  const element = getUiElementAt(root, path);
  if (!(element instanceof Group)) return root;
  const next = element.clone() as Group;
  next.label = label.trim() || undefined;
  return replaceUiAtPath(root, path, next);
}

export function updateLabelText(root: UiElement, path: UiPath, text: string): UiElement {
  const element = getUiElementAt(root, path);
  if (!(element instanceof Label)) return root;
  const next = element.clone() as Label;
  next.text = text;
  return replaceUiAtPath(root, path, next);
}

export function getUiInsertParentPath(root: UiElement, targetPath: UiPath): UiPath {
  if (targetPath.length === 0) return [];
  const target = getUiElementAt(root, targetPath);
  if (isLayoutElement(target)) return targetPath;
  return getUiParentPath(targetPath);
}

export function listUiChildren(element: UiElement, path: UiPath): UiPath[] {
  if (!isLayoutElement(element)) return [];
  return element.elements.map((_, index) => [...path, index]);
}

export { buildPropertyScope };
