import {
  ArraySchema,
  CompositionSchema,
  DEFS_SEGMENT,
  ObjectSchema,
  RefSchema,
  SchemaDocument,
  SchemaNode,
  StringSchema,
  buildDefRef,
  parseDefRef,
} from "@jsonschema-editor/json-schema";
import { formatToSchemaKind } from "./schema-type-kinds";
import type { SchemaPath } from "./schema-editor";
import {
  createSchemaByKind,
  getSchemaAtPath,
  listSchemaChildren,
  parseTupleBranchPath,
  replaceNodeAtPath,
  suggestPropertyName,
} from "./schema-editor";
import { patchSchemaAttribute } from "./schema-attributes";
import {
  getSchemaTypeExtension,
  resolveSchemaTypeExtensionId,
} from "../registry/schema-type-extension-registry.js";

type CompositionOperator = "allOf" | "anyOf" | "oneOf";

export { DEFS_SEGMENT };

export function isDefsContainerPath(path: SchemaPath): boolean {
  return path.length === 1 && path[0] === DEFS_SEGMENT;
}

export function isDefRootPath(path: SchemaPath): boolean {
  return path.length === 2 && path[0] === DEFS_SEGMENT;
}

export function getNodeAtPath(document: SchemaDocument, path: SchemaPath): SchemaNode {
  const resolveRef = (ref: string) => document.resolveRef(ref);

  if (path.length >= 2 && path[0] === DEFS_SEGMENT) {
    const defName = path[1];
    const def = document.getDef(defName);
    if (!def) throw new Error(`Definition nicht gefunden: ${defName}`);
    if (path.length === 2) return def;
    return getSchemaAtPath(def, path.slice(2), resolveRef);
  }
  return getSchemaAtPath(document.root, path, resolveRef);
}

export function tryGetNodeAtPath(
  document: SchemaDocument,
  path: SchemaPath,
): SchemaNode | undefined {
  try {
    return getNodeAtPath(document, path);
  } catch {
    return undefined;
  }
}

export function isValidDocumentPath(document: SchemaDocument, path: SchemaPath): boolean {
  return tryGetNodeAtPath(document, path) !== undefined;
}

export function listDocumentChildren(document: SchemaDocument, path: SchemaPath): SchemaPath[] {
  if (isDefsContainerPath(path)) {
    return document.listDefNames().map((name) => [DEFS_SEGMENT, name]);
  }

  try {
    const node = getNodeAtPath(document, path);
    const listFrom = node instanceof RefSchema ? document.resolveNode(node) : node;
    const raw = listSchemaChildren(listFrom, path);
    const filtered = raw.filter((childPath) => isValidDocumentPath(document, childPath));
    if (filtered.length < raw.length) {
      // #region agent log
      fetch("http://127.0.0.1:7253/ingest/89292584-bc94-485e-a1bb-b6d2d881ebc7", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "76abc3" },
        body: JSON.stringify({
          sessionId: "76abc3",
          hypothesisId: "A",
          location: "schema-document.ts:listDocumentChildren",
          message: "filtered invalid child paths",
          data: {
            parentPath: path,
            dropped: raw.filter((p) => !filtered.includes(p)),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    }
    return filtered;
  } catch {
    return [];
  }
}

function replaceInDocument(
  document: SchemaDocument,
  path: SchemaPath,
  replacement: SchemaNode,
): SchemaDocument {
  const next = document.clone();

  if (path.length >= 2 && path[0] === DEFS_SEGMENT) {
    const defName = path[1];
    const innerPath = path.slice(2);
    if (innerPath.length === 0) {
      next.setDef(defName, replacement.clone());
    } else {
      const def = next.getDef(defName);
      if (!def) throw new Error(`Definition nicht gefunden: ${defName}`);
      next.setDef(defName, replaceNodeAtPath(def, innerPath, replacement));
    }
    return next;
  }

  if (path.length === 0) {
    next.root = replacement.clone();
    return next;
  }

  next.root = replaceNodeAtPath(next.root, path, replacement);
  return next;
}

export function suggestDefName(document: SchemaDocument): string {
  let index = document.listDefNames().length + 1;
  let name = `Type${index}`;
  while (document.hasDef(name)) {
    index += 1;
    name = `Type${index}`;
  }
  return name;
}

export function addDefinition(
  document: SchemaDocument,
  kind = "object",
  requestedName?: string,
): SchemaDocument {
  const name = requestedName?.trim() || suggestDefName(document);
  if (!name || document.hasDef(name)) return document;

  const next = document.clone();
  next.setDef(name, createSchemaByKind(kind));
  return next;
}

export function removeDefinition(document: SchemaDocument, defName: string): SchemaDocument {
  if (!document.hasDef(defName)) return document;
  const next = document.clone();
  next.removeDef(defName);
  return next;
}

export function renameDefinition(
  document: SchemaDocument,
  oldName: string,
  newName: string,
): SchemaDocument {
  const next = document.clone();
  if (!next.renameDef(oldName, newName.trim())) return document;
  return next;
}

export function addObjectPropertyToDocument(
  document: SchemaDocument,
  objectPath: SchemaPath,
  kind = "string",
  requestedName?: string,
): SchemaDocument {
  const object = getNodeAtPath(document, objectPath);
  if (!(object instanceof ObjectSchema)) throw new Error("Kein Objekt");

  const name = requestedName?.trim() || suggestPropertyName(object);
  if (!name || object.getProperty(name)) return document;

  const nextObject = object.clone() as ObjectSchema;
  nextObject.setProperty(name, createSchemaByKind(kind));
  return replaceInDocument(document, objectPath, nextObject);
}

export function addObjectPropertyRef(
  document: SchemaDocument,
  objectPath: SchemaPath,
  defName: string,
  requestedName?: string,
): SchemaDocument {
  if (!document.hasDef(defName)) return document;

  const object = getNodeAtPath(document, objectPath);
  if (!(object instanceof ObjectSchema)) throw new Error("Kein Objekt");

  const name = requestedName?.trim() || suggestPropertyName(object);
  if (!name || object.getProperty(name)) return document;

  const nextObject = object.clone() as ObjectSchema;
  nextObject.setProperty(name, new RefSchema(buildDefRef(defName, document.defsKey)));
  return replaceInDocument(document, objectPath, nextObject);
}

export function addCompositionBranchToDocument(
  document: SchemaDocument,
  compositionPath: SchemaPath,
  operator: CompositionOperator,
): SchemaDocument {
  const composition = getNodeAtPath(document, compositionPath);

  if (!(composition instanceof CompositionSchema)) {
    const wrapper = new CompositionSchema();
    wrapper.addBranch(operator, composition.clone());
    const branch = new ObjectSchema();
    branch.title = "Variante 2";
    wrapper.addBranch(operator, branch);
    return replaceInDocument(document, compositionPath, wrapper);
  }

  const next = composition.clone() as CompositionSchema;
  const branch = new ObjectSchema();
  branch.title = `Variante ${next.getChildren().length + 1}`;
  next.addBranch(operator, branch);
  return replaceInDocument(document, compositionPath, next);
}

export function addCompositionBranchRef(
  document: SchemaDocument,
  compositionPath: SchemaPath,
  operator: CompositionOperator,
  defName: string,
): SchemaDocument {
  if (!document.hasDef(defName)) return document;

  const composition = getNodeAtPath(document, compositionPath);

  if (!(composition instanceof CompositionSchema)) {
    const wrapper = new CompositionSchema();
    wrapper.addBranch(operator, composition.clone());
    wrapper.addBranch(operator, new RefSchema(buildDefRef(defName, document.defsKey)));
    return replaceInDocument(document, compositionPath, wrapper);
  }

  const next = composition.clone() as CompositionSchema;
  next.addBranch(operator, new RefSchema(buildDefRef(defName, document.defsKey)));
  return replaceInDocument(document, compositionPath, next);
}

export function removeNodeAtPath(document: SchemaDocument, path: SchemaPath): SchemaDocument {
  if (path.length === 0) return document;

  if (isDefRootPath(path)) {
    return removeDefinition(document, path[1]);
  }

  const parentPath = path.slice(0, -1);
  const last = path[path.length - 1];

  const tupleBranch = parseTupleBranchPath(path);
  if (tupleBranch) {
    const parent = getNodeAtPath(document, tupleBranch.arrayPath);
    if (!(parent instanceof ArraySchema)) return document;
    const next = parent.clone() as ArraySchema;
    next.removePrefixItem(tupleBranch.index);
    return replaceInDocument(document, tupleBranch.arrayPath, next);
  }

  if (last === "items") {
    const parent = getNodeAtPath(document, parentPath);
    if (!(parent instanceof ArraySchema)) return document;
    const next = parent.clone() as ArraySchema;
    next.clearItems();
    return replaceInDocument(document, parentPath, next);
  }

  const compositionBranch =
    path.length >= 2 &&
    (path[path.length - 2] === "allOf" ||
      path[path.length - 2] === "anyOf" ||
      path[path.length - 2] === "oneOf") &&
    /^\d+$/.test(last);

  if (compositionBranch) {
    const operator = path[path.length - 2] as CompositionOperator;
    const compositionPath = path.slice(0, -2);
    const parent = getNodeAtPath(document, compositionPath);
    if (!(parent instanceof CompositionSchema)) return document;

    const next = parent.clone() as CompositionSchema;
    next.removeBranch(operator, Number(last));
    return replaceInDocument(document, compositionPath, next);
  }

  const parent = getNodeAtPath(document, parentPath);
  if (parent instanceof ObjectSchema) {
    const next = parent.clone() as ObjectSchema;
    next.removeProperty(last);
    return replaceInDocument(document, parentPath, next);
  }

  return document;
}

export function setPropertyKindInDocument(
  document: SchemaDocument,
  propertyPath: SchemaPath,
  kind: string,
): SchemaDocument {
  const existing = getNodeAtPath(document, propertyPath);
  const field = createSchemaByKind(kind);
  field.title = existing.title;
  field.description = existing.description;
  return replaceInDocument(document, propertyPath, field);
}

export function setPropertyRefInDocument(
  document: SchemaDocument,
  propertyPath: SchemaPath,
  defName: string,
): SchemaDocument {
  if (!document.hasDef(defName)) return document;
  const existing = getNodeAtPath(document, propertyPath);
  const ref = new RefSchema(buildDefRef(defName, document.defsKey));
  ref.title = existing.title;
  ref.description = existing.description;
  return replaceInDocument(document, propertyPath, ref);
}

export function setArrayItemsInDocument(
  document: SchemaDocument,
  arrayPath: SchemaPath,
  kind: string,
): SchemaDocument {
  const array = getNodeAtPath(document, arrayPath);
  if (!(array instanceof ArraySchema)) throw new Error("Kein Array");
  const next = array.clone() as ArraySchema;
  next.setItems(createSchemaByKind(kind));
  return replaceInDocument(document, arrayPath, next);
}

export function updateNodeAtPath(
  document: SchemaDocument,
  path: SchemaPath,
  updater: (node: SchemaNode) => void,
): SchemaDocument {
  const node = getNodeAtPath(document, path);
  const clone = node.clone();
  updater(clone);
  return replaceInDocument(document, path, clone);
}

export function renamePropertyInDocument(
  document: SchemaDocument,
  objectPath: SchemaPath,
  oldName: string,
  newName: string,
): SchemaDocument {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return document;

  const object = getNodeAtPath(document, objectPath);
  if (!(object instanceof ObjectSchema)) return document;

  const prop = object.getProperty(oldName);
  if (!prop || object.getProperty(trimmed)) return document;

  const next = object.clone() as ObjectSchema;
  next.setProperty(trimmed, prop.clone(), object.isPropertyRequired(oldName));
  next.removeProperty(oldName);
  return replaceInDocument(document, objectPath, next);
}

export function setPropertyRequiredInDocument(
  document: SchemaDocument,
  propertyPath: SchemaPath,
  required: boolean,
): SchemaDocument {
  if (propertyPath.length === 0) return document;

  const name = propertyPath[propertyPath.length - 1];
  const objectPath = propertyPath.slice(0, -1);
  const object = getNodeAtPath(document, objectPath);

  if (!(object instanceof ObjectSchema)) return document;

  const prop = object.getProperty(name);
  if (!prop) return document;

  const next = object.clone() as ObjectSchema;
  next.setProperty(name, prop.clone(), required);
  return replaceInDocument(document, objectPath, next);
}

export function getDocumentKindLabel(node: SchemaNode): string {
  if (node instanceof RefSchema) {
    const parsed = parseDefRef(node.ref);
    return parsed ? `$ref → ${parsed.name}` : "$ref";
  }
  if (node instanceof CompositionSchema) {
    const operators: string[] = [];
    if (node.allOf.length) operators.push("allOf");
    if (node.anyOf.length) operators.push("anyOf");
    if (node.oneOf.length) operators.push("oneOf");
    return operators.length ? operators.join(" + ") : "Komposition";
  }

  const extensionId = resolveSchemaTypeExtensionId(node);
  if (extensionId) {
    const extension = getSchemaTypeExtension(extensionId);
    return extension?.label ?? extensionId;
  }

  if (node instanceof StringSchema) {
    const formatKind = formatToSchemaKind(node.format);
    if (formatKind) return formatKind;
    if (node.format) return node.format;
  }
  return node.kind;
}

export function getDocumentNodeLabel(node: SchemaNode, path: SchemaPath): string {
  if (isDefRootPath(path)) return path[1];
  if (path.length === 0) return node.title ?? "Root";
  const last = path[path.length - 1];
  if (last === "items") return "items";
  if (last === "prefixItems") return "prefixItems";
  const tupleBranch = parseTupleBranchPath(path);
  if (tupleBranch) return `${tupleBranch.keyword}[${tupleBranch.index}]`;
  if (last === "allOf" || last === "anyOf" || last === "oneOf") return last;
  if (/^\d+$/.test(last)) {
    const operator = path[path.length - 2];
    return `${operator}[${last}]`;
  }
  return last;
}

export function getPropertyParentPathInDocument(path: SchemaPath): SchemaPath | null {
  if (path.length === 0) return null;
  if (isDefRootPath(path)) return [DEFS_SEGMENT];
  const last = path[path.length - 1];
  if (parseTupleBranchPath(path)) return path.slice(0, -2);
  if (last === "items" || last === "prefixItems") return path.slice(0, -1);
  if (last === "allOf" || last === "anyOf" || last === "oneOf") return null;
  if (/^\d+$/.test(last)) return path.slice(0, -1);
  return path.slice(0, -1);
}

export function canDeleteDocumentNode(path: SchemaPath): boolean {
  return path.length > 0 && !isDefsContainerPath(path);
}

export function canAddToDefsContainer(path: SchemaPath): boolean {
  return isDefsContainerPath(path);
}

export function collectDescendantPaths(document: SchemaDocument, startPath: SchemaPath): SchemaPath[] {
  const paths: SchemaPath[] = [];
  const queue: SchemaPath[] = [startPath];

  while (queue.length > 0) {
    const path = queue.shift()!;
    paths.push(path);
    const node = getNodeAtPath(document, path);
    for (const childPath of listSchemaChildren(node, path)) {
      queue.push(childPath);
    }
  }

  return paths;
}

export function applyFieldAttributeToDescendants(
  document: SchemaDocument,
  startPath: SchemaPath,
  attributeName: string,
  value: boolean,
): SchemaDocument {
  let next = document;
  for (const path of collectDescendantPaths(document, startPath)) {
    next = patchSchemaAttribute(next, path, attributeName, value);
  }
  return next;
}
