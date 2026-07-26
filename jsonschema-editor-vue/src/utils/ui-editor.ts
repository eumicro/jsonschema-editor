import type { SchemaDocument } from "@jsonschema-editor/json-schema";
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
  controlSupportsDetail,
  defaultUiSchemaFactory,
  type UiElement,
} from "@jsonschema-editor/ui-schema";
import { buildPropertyScope } from "@jsonschema-editor/ui-schema";
import { createTranslator } from "../i18n/createTranslator.js";
import type { TranslateFn } from "../i18n/types.js";

const defaultTranslate = createTranslator().t;

/** Path segment: child index, or `"detail"` for JSON Forms `options.detail`. */
export type UiPathSegment = number | "detail";
export type UiPath = UiPathSegment[];

export function uiPathKey(path: UiPath): string {
  return path.length ? path.join(".") : "root";
}

export function parseUiPathKey(key: string): UiPath {
  if (!key || key === "root") return [];
  return key.split(".").map((segment) =>
    segment === "detail" ? "detail" : Number.parseInt(segment, 10),
  );
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
  for (const segment of path) {
    if (segment === "detail") {
      if (!(current instanceof Control) || !current.detail) {
        throw new Error("Kein Detail");
      }
      current = current.detail;
      continue;
    }
    if (!isLayoutElement(current)) {
      throw new Error("Kein Layout");
    }
    const child = current.getChild(segment);
    if (!child) throw new Error(`Kind an Index ${segment} fehlt`);
    current = child;
  }
  return current;
}

export function getUiParentPath(path: UiPath): UiPath {
  return path.slice(0, -1);
}

export function findEnclosingDetailPath(path: UiPath): UiPath | null {
  const index = path.lastIndexOf("detail");
  if (index === -1) return null;
  return path.slice(0, index + 1);
}

export function controlPathOfDetail(detailPath: UiPath): UiPath {
  if (detailPath[detailPath.length - 1] !== "detail") {
    throw new Error("Kein Detail-Pfad");
  }
  return detailPath.slice(0, -1);
}

function replaceUiAtPath(root: UiElement, path: UiPath, replacement: UiElement): UiElement {
  if (path.length === 0) return replacement.clone();

  const [head, ...rest] = path;

  if (head === "detail") {
    if (!(root instanceof Control)) throw new Error("Kein Control");
    const next = root.clone() as Control;
    if (rest.length === 0) {
      next.detail = replacement.clone();
    } else {
      if (!next.detail) throw new Error("Kein Detail");
      next.detail = replaceUiAtPath(next.detail, rest, replacement);
    }
    return next;
  }

  if (typeof head !== "number" || !isLayoutElement(root)) {
    throw new Error("Kein Layout");
  }

  const parentClone = root.clone();
  if (!isLayoutElement(parentClone)) throw new Error("Kein Layout");

  if (rest.length === 0) {
    parentClone.setChild(head, replacement.clone());
  } else {
    const child = parentClone.getChild(head);
    if (!child) throw new Error(`Kind an Index ${head} fehlt`);
    parentClone.setChild(head, replaceUiAtPath(child, rest, replacement));
  }
  return parentClone;
}

/** Ensures JSON Forms `options.detail` is a layout (default VerticalLayout). */
export function ensureControlDetailLayout(root: UiElement, controlPath: UiPath): UiElement {
  const control = getUiElementAt(root, controlPath);
  if (!(control instanceof Control)) return root;
  if (control.detail && isLayoutElement(control.detail)) return root;

  const next = control.clone() as Control;
  if (control.detail) {
    const layout = new VerticalLayout();
    layout.addChild(control.detail.clone());
    next.detail = layout;
  } else {
    next.detail = new VerticalLayout();
  }
  return replaceUiAtPath(root, controlPath, next);
}

export function insertUiElement(
  root: UiElement,
  parentPath: UiPath,
  element: UiElement,
  index?: number,
): UiElement {
  let workingRoot = root;
  let workingParentPath = parentPath;

  if (workingParentPath[workingParentPath.length - 1] === "detail") {
    workingRoot = ensureControlDetailLayout(workingRoot, controlPathOfDetail(workingParentPath));
  }

  const parent = getUiElementAt(workingRoot, workingParentPath);
  if (!isLayoutElement(parent)) throw new Error("Eltern ist kein Layout");

  const parentClone = parent.clone();
  if (!isLayoutElement(parentClone)) throw new Error("Eltern ist kein Layout");
  parentClone.insertChild(index ?? parentClone.elements.length, element.clone());
  return replaceUiAtPath(workingRoot, workingParentPath, parentClone);
}

export function removeUiElement(root: UiElement, path: UiPath): UiElement {
  if (path.length === 0) return root;

  const last = path[path.length - 1];
  if (last === "detail") {
    const controlPath = path.slice(0, -1);
    const control = getUiElementAt(root, controlPath);
    if (!(control instanceof Control)) return root;
    const next = control.clone() as Control;
    next.detail = undefined;
    return replaceUiAtPath(root, controlPath, next);
  }

  if (typeof last !== "number") return root;

  const parentPath = getUiParentPath(path);
  const parent = getUiElementAt(root, parentPath);
  if (!isLayoutElement(parent)) throw new Error("Eltern ist kein Layout");

  const parentClone = parent.clone();
  if (!isLayoutElement(parentClone)) throw new Error("Eltern ist kein Layout");
  parentClone.removeChild(last);
  return replaceUiAtPath(root, parentPath, parentClone);
}

export function moveUiElement(root: UiElement, from: UiPath, to: UiPath): UiElement {
  const fromParentPath = getUiParentPath(from);
  const toParentPath = getUiParentPath(to);
  const fromIndex = from[from.length - 1];
  const toIndex = to[to.length - 1];
  if (typeof fromIndex !== "number" || typeof toIndex !== "number") return root;

  if (uiPathKey(fromParentPath) !== uiPathKey(toParentPath)) {
    return root;
  }

  const parent = getUiElementAt(root, fromParentPath);
  if (!isLayoutElement(parent)) return root;

  const parentClone = parent.clone();
  if (!isLayoutElement(parentClone)) return root;
  parentClone.moveChild(fromIndex, toIndex);
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
  if (from[from.length - 1] === "detail") return false;
  if (isSameOrAncestorPath(from, toParent)) return false;

  try {
    let workingRoot = root;
    let workingParent = toParent;
    if (workingParent[workingParent.length - 1] === "detail") {
      workingRoot = ensureControlDetailLayout(workingRoot, controlPathOfDetail(workingParent));
    }

    const element = getUiElementAt(workingRoot, from);
    const targetParent = getUiElementAt(workingRoot, workingParent);
    if (!canAcceptUiChild(targetParent, element)) return false;

    const fromParent = getUiParentPath(from);
    const fromIndex = from[from.length - 1];
    if (typeof fromIndex !== "number") return false;

    if (uiPathKey(fromParent) === uiPathKey(workingParent)) {
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

  if (typeof removedIndex !== "number") {
    if (isSameOrAncestorPath(removed, path)) return removedParent;
    return path;
  }

  if (path.length < removedParent.length) return path;
  for (let index = 0; index < removedParent.length; index += 1) {
    if (path[index] !== removedParent[index]) return path;
  }

  const next = [...path];
  const affectedIndex = next[removedParent.length];
  if (typeof affectedIndex === "number" && affectedIndex > removedIndex) {
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
  if (adjustedParent[adjustedParent.length - 1] === "detail") {
    next = ensureControlDetailLayout(next, controlPathOfDetail(adjustedParent));
  }

  const targetParent = getUiElementAt(next, adjustedParent);
  const maxIndex = isLayoutElement(targetParent) ? targetParent.elements.length : 0;
  let insertIndex = Math.max(0, Math.min(toIndex, maxIndex));

  const fromParent = getUiParentPath(from);
  const fromIndex = from[from.length - 1];
  if (
    typeof fromIndex === "number" &&
    uiPathKey(fromParent) === uiPathKey(adjustedParent) &&
    fromIndex < insertIndex
  ) {
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

/** Set or clear a JSON Forms `options.*` key on a Control (preserves `options.detail`). */
export function updateControlOption(
  root: UiElement,
  path: UiPath,
  key: string,
  value: unknown,
): UiElement {
  const control = getUiElementAt(root, path);
  if (!(control instanceof Control)) return root;

  const json = control.toJSON();
  const options: Record<string, unknown> = {
    ...(json.options && typeof json.options === "object" && !Array.isArray(json.options)
      ? (json.options as Record<string, unknown>)
      : {}),
  };

  if (value === undefined || value === null || value === "") {
    delete options[key];
  } else {
    options[key] = value;
  }

  if (Object.keys(options).length > 0) json.options = options;
  else delete json.options;

  const restored = defaultUiSchemaFactory.fromJSON(json);
  return replaceUiAtPath(root, path, restored);
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
  return updateElementLabel(root, path, label);
}

/** Label für Group, Category oder Step aktualisieren. */
export function updateElementLabel(root: UiElement, path: UiPath, label: string): UiElement {
  const element = getUiElementAt(root, path);
  if (
    !(element instanceof Group) &&
    !(element instanceof Category) &&
    !(element instanceof Step)
  ) {
    return root;
  }
  const next = element.clone() as Group | Category | Step;
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

/** Set or clear the JSON Forms `i18n` prefix on any UI element. */
export function updateElementI18n(
  root: UiElement,
  path: UiPath,
  i18n: string | undefined,
): UiElement {
  const element = getUiElementAt(root, path);
  const next = element.clone();
  next.i18n = i18n?.trim() || undefined;
  return replaceUiAtPath(root, path, next);
}

export function controlAllowsDetail(
  element: UiElement,
  document?: SchemaDocument | null,
): element is Control {
  if (!(element instanceof Control)) return false;
  if (element.detail) return true;
  return controlSupportsDetail(document, element.scope);
}

export function getUiInsertParentPath(
  root: UiElement,
  targetPath: UiPath,
  document?: SchemaDocument | null,
): UiPath {
  if (targetPath.length === 0) return [];

  // Prefer an existing detail ancestor (JSON Forms options.detail).
  const detailAncestor = findEnclosingDetailPath(targetPath);
  if (detailAncestor) {
    try {
      getUiElementAt(root, detailAncestor);
      return detailAncestor;
    } catch {
      // Detail path selected before options.detail exists — fall back to control.
      return detailAncestor.slice(0, -1);
    }
  }

  let target: UiElement;
  try {
    target = getUiElementAt(root, targetPath);
  } catch {
    return getUiParentPath(targetPath);
  }

  if (isLayoutElement(target)) return targetPath;
  if (controlAllowsDetail(target, document)) return [...targetPath, "detail"];
  return getUiParentPath(targetPath);
}

export function listUiChildren(element: UiElement, path: UiPath): UiPath[] {
  if (isLayoutElement(element)) {
    return element.elements.map((_, index) => [...path, index]);
  }
  if (element instanceof Control && element.detail && isLayoutElement(element.detail)) {
    return element.detail.elements.map((_, index) => [...path, "detail", index]);
  }
  return [];
}

export { buildPropertyScope };
