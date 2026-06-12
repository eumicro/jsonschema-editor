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

export type UiPath = number[];

export function uiPathKey(path: UiPath): string {
  return path.length ? path.join(".") : "root";
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
  options?: { scope?: string; label?: string; text?: string },
): UiElement {
  switch (kind) {
    case "Control":
      return new Control(options?.scope ?? "#/properties/field", options?.label ?? "Feld");
    case "Group":
      return new Group(options?.label ?? "Gruppe");
    case "HorizontalLayout":
      return new HorizontalLayout();
    case "Label":
      return new Label(options?.text ?? "Beschriftung");
    case "Categorization":
      return new Categorization();
    case "Category":
      return new Category(options?.label ?? "Kategorie");
    case "Stepper":
      return new Stepper();
    case "Step":
      return new Step(options?.label ?? "Schritt");
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
): UiElement {
  const element = getUiElementAt(root, path);
  if (!isLayoutElement(element)) return root;

  const replacement = createUiElement(
    kind,
    kind === "Group" ? { label: groupLabel ?? (element instanceof Group ? element.label : undefined) } : undefined,
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
