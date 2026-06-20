import {
  ArraySchema,
  BooleanSchema,
  CompositionSchema,
  IntegerSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  RefSchema,
  SchemaNode,
  StringSchema,
} from "@jsonschema-editor/json-schema";
import {
  getSchemaTypeExtension,
  resolveSchemaTypeExtensionId,
} from "../registry/schema-type-extension-registry.js";
import {
  FORMAT_BY_STRING_KIND,
  formatToSchemaKind,
} from "./schema-type-kinds";

type CompositionOperator = "allOf" | "anyOf" | "oneOf";

const COMPOSITION_OPERATORS = new Set<string>(["allOf", "anyOf", "oneOf"]);
const TUPLE_KEYWORDS = new Set<string>(["prefixItems", "items"]);

export type SchemaPath = string[];

export function parseTupleBranchPath(
  path: SchemaPath,
): { arrayPath: SchemaPath; keyword: "prefixItems" | "items"; index: number } | null {
  if (path.length < 2) return null;

  const indexSegment = path[path.length - 1];
  const keywordSegment = path[path.length - 2];

  if (!TUPLE_KEYWORDS.has(keywordSegment) || !/^\d+$/.test(indexSegment)) {
    return null;
  }

  return {
    arrayPath: path.slice(0, -2),
    keyword: keywordSegment as "prefixItems" | "items",
    index: Number(indexSegment),
  };
}

function parseCompositionBranchPath(
  path: SchemaPath,
): { compositionPath: SchemaPath; operator: CompositionOperator; index: number } | null {
  if (path.length < 2) return null;

  const indexSegment = path[path.length - 1];
  const operatorSegment = path[path.length - 2];

  if (!COMPOSITION_OPERATORS.has(operatorSegment) || !/^\d+$/.test(indexSegment)) {
    return null;
  }

  return {
    compositionPath: path.slice(0, -2),
    operator: operatorSegment as CompositionOperator,
    index: Number(indexSegment),
  };
}

export function schemaPathKey(path: SchemaPath): string {
  return path.length ? path.join(".") : "root";
}

export function getSchemaAtPath(
  root: SchemaNode,
  path: SchemaPath,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): SchemaNode {
  if (path.length === 0) return root;

  let current: SchemaNode = root;
  let i = 0;

  while (i < path.length) {
    if (current instanceof RefSchema && resolveRef) {
      const resolved = resolveRef(current.ref);
      if (resolved) current = resolved;
    }

    const segment = path[i];

    if (segment === "prefixItems") {
      if (!(current instanceof ArraySchema)) {
        throw new Error("Ungültiger Pfad: prefixItems");
      }
      const index = Number(path[i + 1]);
      const item = current.getPrefixItem(index);
      if (!item) throw new Error(`Ungültiger Pfad: prefixItems[${index}]`);
      current = item;
      i += 2;
      continue;
    }

    if (segment === "items") {
      if (!(current instanceof ArraySchema)) {
        throw new Error("Ungültiger Pfad: items");
      }
      const next = path[i + 1];
      if (next !== undefined && /^\d+$/.test(next) && current.itemsMode === "tuple") {
        const item = current.getPrefixItem(Number(next));
        if (!item) throw new Error(`Ungültiger Pfad: items[${next}]`);
        current = item;
        i += 2;
        continue;
      }
      if (!current.items) {
        throw new Error("Ungültiger Pfad: items");
      }
      current = current.items;
      i += 1;
      continue;
    }

    if (segment === "allOf" || segment === "anyOf" || segment === "oneOf") {
      if (!(current instanceof CompositionSchema)) {
        throw new Error(`Ungültiger Pfad: ${segment}`);
      }
      const index = Number(path[i + 1]);
      const branches =
        segment === "allOf"
          ? current.allOf
          : segment === "anyOf"
            ? current.anyOf
            : current.oneOf;
      current = branches[index];
      i += 2;
      continue;
    }

    if (current instanceof CompositionSchema) {
      const merged = current.mergeToObject();
      if (merged) current = merged;
    }

    if (!(current instanceof ObjectSchema)) {
      throw new Error(`Ungültiger Pfad: ${segment}`);
    }

    const next = current.getProperty(segment);
    if (!next) throw new Error(`Eigenschaft nicht gefunden: ${segment}`);
    current = next;
    i += 1;
  }

  return current;
}

/** Anzeige-/Auswahl-Typ inkl. string-Formate wie date / date-time. */
export function resolveSchemaDisplayKind(node: SchemaNode): string {
  const extensionId = resolveSchemaTypeExtensionId(node);
  if (extensionId) return extensionId;

  if (node instanceof StringSchema) {
    const formatKind = formatToSchemaKind(node.format);
    if (formatKind) return formatKind;
  }
  return node.kind;
}

/** Anzeige im Baum – kein JSON-Schema-`type`, sondern lesbare Art des Knotens. */
export function getSchemaKindLabel(node: SchemaNode): string {
  if (node instanceof CompositionSchema) {
    const operators: string[] = [];
    if (node.allOf.length) operators.push("allOf");
    if (node.anyOf.length) operators.push("anyOf");
    if (node.oneOf.length) operators.push("oneOf");
    return operators.length ? operators.join(" + ") : "Komposition";
  }
  return resolveSchemaDisplayKind(node);
}

export function getSchemaLabel(node: SchemaNode, path: SchemaPath): string {
  if (path.length === 0) return node.title ?? "Root";
  const last = path[path.length - 1];
  if (last === "items") return "items";
  if (last === "prefixItems") return "prefixItems";
  const tupleBranch = parseTupleBranchPath(path);
  if (tupleBranch) return `${tupleBranch.keyword}[${tupleBranch.index}]`;
  const branch = parseCompositionBranchPath(path);
  if (branch) return `${branch.operator}[${branch.index}]`;
  return last;
}

export function buildSchemaScope(path: SchemaPath): string {
  const segments: string[] = [];
  for (const segment of path) {
    if (
      segment === "allOf" ||
      segment === "anyOf" ||
      segment === "oneOf" ||
      segment === "items" ||
      segment === "prefixItems" ||
      /^\d+$/.test(segment)
    ) {
      continue;
    }
    segments.push(segment);
  }
  if (segments.length === 0) return "#";
  return `#/properties/${segments.join("/properties/")}`;
}

export function listSchemaChildren(node: SchemaNode, path: SchemaPath): SchemaPath[] {
  const children: SchemaPath[] = [];

  if (node instanceof ObjectSchema) {
    for (const [name] of node.properties) {
      children.push([...path, name]);
    }
  }

  if (node instanceof CompositionSchema) {
    for (let i = 0; i < node.allOf.length; i++) {
      children.push([...path, "allOf", String(i)]);
    }
    for (let i = 0; i < node.anyOf.length; i++) {
      children.push([...path, "anyOf", String(i)]);
    }
    for (let i = 0; i < node.oneOf.length; i++) {
      children.push([...path, "oneOf", String(i)]);
    }
  }

  if (node instanceof ArraySchema) {
    if (node.itemsMode === "tuple") {
      const keyword = node.tupleKeyword;
      for (let i = 0; i < node.prefixItems.length; i++) {
        children.push([...path, keyword, String(i)]);
      }
      if (node.items && keyword === "prefixItems") {
        children.push([...path, "items"]);
      }
    } else if (node.items) {
      children.push([...path, "items"]);
    }
  }

  return children;
}

export function createSchemaByKind(kind: string): SchemaNode {
  switch (kind) {
    case "object":
      return new ObjectSchema();
    case "array":
      return new ArraySchema();
    case "number":
      return new NumberSchema();
    case "integer":
      return new IntegerSchema();
    case "boolean":
      return new BooleanSchema();
    case "null":
      return new NullSchema();
    case "composition":
      return new CompositionSchema();
    case "date":
    case "date-time": {
      const field = new StringSchema();
      field.format = FORMAT_BY_STRING_KIND[kind];
      return field;
    }
    default: {
      const extension = getSchemaTypeExtension(kind);
      if (extension) return extension.create();
      return new StringSchema();
    }
  }
}

export function replaceNodeAtPath(root: SchemaNode, path: SchemaPath, replacement: SchemaNode): SchemaNode {
  if (path.length === 0) return replacement.clone();

  const [head, ...tail] = path;

  if (head === "prefixItems") {
    if (!(root instanceof ArraySchema)) throw new Error("Kein Array");
    const index = Number(tail[0]);
    const next = root.clone() as ArraySchema;
    const branch = next.getPrefixItem(index);
    if (!branch) throw new Error(`Tuple-Element prefixItems[${index}] fehlt`);
    const updatedBranch = tail.length > 1
      ? replaceNodeAtPath(branch, tail.slice(1), replacement)
      : replacement.clone();
    next.setPrefixItem(index, updatedBranch);
    return next;
  }

  if (head === "items") {
    if (!(root instanceof ArraySchema)) throw new Error("Kein Array");
    const next = root.clone() as ArraySchema;
    if (tail.length > 0 && /^\d+$/.test(tail[0]) && next.itemsMode === "tuple") {
      const index = Number(tail[0]);
      const branch = next.getPrefixItem(index);
      if (!branch) throw new Error(`Tuple-Element items[${index}] fehlt`);
      const updatedBranch = tail.length > 1
        ? replaceNodeAtPath(branch, tail.slice(1), replacement)
        : replacement.clone();
      next.setPrefixItem(index, updatedBranch);
      return next;
    }
    next.setItems(replaceNodeAtPath(next.items!, tail, replacement));
    return next;
  }

  if (head === "allOf" || head === "anyOf" || head === "oneOf") {
    if (!(root instanceof CompositionSchema)) throw new Error("Keine Komposition");
    const index = Number(tail[0]);
    const operator = head as CompositionOperator;
    const next = root.clone() as CompositionSchema;
    const branch = next.getBranch(operator, index);
    if (!branch) throw new Error(`Zweig ${operator}[${index}] fehlt`);
    const updatedBranch = tail.length > 1
      ? replaceNodeAtPath(branch, tail.slice(1), replacement)
      : replacement.clone();
    next.setBranch(operator, index, updatedBranch);
    return next;
  }

  if (root instanceof CompositionSchema) {
    const merged = root.mergeToObject();
    if (merged) return replaceNodeAtPath(merged, path, replacement);
  }

  if (!(root instanceof ObjectSchema)) throw new Error("Kein Objekt");

  const next = root.clone() as ObjectSchema;
  const existing = next.getProperty(head);
  if (!existing) throw new Error(`Eigenschaft ${head} fehlt`);

  next.setProperty(
    head,
    tail.length ? replaceNodeAtPath(existing, tail, replacement) : replacement.clone(),
    next.isPropertyRequired(head),
  );
  return next;
}

export function suggestPropertyName(object: ObjectSchema): string {
  let index = object.propertyCount + 1;
  let name = `field${index}`;
  while (object.getProperty(name)) {
    index += 1;
    name = `field${index}`;
  }
  return name;
}

export function addObjectProperty(
  root: SchemaNode,
  objectPath: SchemaPath,
  kind = "string",
  requestedName?: string,
): SchemaNode {
  const object = getSchemaAtPath(root, objectPath);
  if (!(object instanceof ObjectSchema)) throw new Error("Kein Objekt");

  const name = requestedName?.trim() || suggestPropertyName(object);
  if (!name || object.getProperty(name)) return root;

  const next = object.clone() as ObjectSchema;
  next.setProperty(name, createSchemaByKind(kind));
  return replaceNodeAtPath(root, objectPath, next);
}

export function renameObjectProperty(
  root: SchemaNode,
  objectPath: SchemaPath,
  oldName: string,
  newName: string,
): SchemaNode {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === oldName) return root;

  const object = getSchemaAtPath(root, objectPath);
  if (!(object instanceof ObjectSchema)) return root;

  const prop = object.getProperty(oldName);
  if (!prop || object.getProperty(trimmed)) return root;

  const next = object.clone() as ObjectSchema;
  next.setProperty(trimmed, prop.clone(), object.isPropertyRequired(oldName));
  next.removeProperty(oldName);
  return replaceNodeAtPath(root, objectPath, next);
}

export function setPropertyKind(
  root: SchemaNode,
  propertyPath: SchemaPath,
  kind: string,
): SchemaNode {
  const existing = getSchemaAtPath(root, propertyPath);
  const field = createSchemaByKind(kind);
  field.title = existing.title;
  field.description = existing.description;
  return replaceNodeAtPath(root, propertyPath, field);
}

export function removeSchemaAtPath(root: SchemaNode, path: SchemaPath): SchemaNode {
  if (path.length === 0) return root;

  const parentPath = path.slice(0, -1);
  const last = path[path.length - 1];

  const tupleBranch = parseTupleBranchPath(path);
  if (tupleBranch) {
    const parent = getSchemaAtPath(root, tupleBranch.arrayPath);
    if (!(parent instanceof ArraySchema)) return root;
    const next = parent.clone() as ArraySchema;
    next.removePrefixItem(tupleBranch.index);
    return replaceNodeAtPath(root, tupleBranch.arrayPath, next);
  }

  if (last === "items") {
    const parent = getSchemaAtPath(root, parentPath);
    if (!(parent instanceof ArraySchema)) return root;
    const next = parent.clone() as ArraySchema;
    next.clearItems();
    return replaceNodeAtPath(root, parentPath, next);
  }

  const compositionBranch = parseCompositionBranchPath(path);
  if (compositionBranch) {
    const parent = getSchemaAtPath(root, compositionBranch.compositionPath);
    if (!(parent instanceof CompositionSchema)) return root;

    const next = parent.clone() as CompositionSchema;
    next.removeBranch(compositionBranch.operator, compositionBranch.index);
    return replaceNodeAtPath(root, compositionBranch.compositionPath, next);
  }

  const parent = getSchemaAtPath(root, parentPath);
  if (parent instanceof ObjectSchema) {
    const next = parent.clone() as ObjectSchema;
    next.removeProperty(last);
    return replaceNodeAtPath(root, parentPath, next);
  }

  return root;
}

export function addCompositionBranch(
  root: SchemaNode,
  compositionPath: SchemaPath,
  operator: CompositionOperator,
): SchemaNode {
  let composition = getSchemaAtPath(root, compositionPath);

  if (!(composition instanceof CompositionSchema)) {
    const wrapper = new CompositionSchema();
    wrapper.addBranch(operator, composition.clone());
    const branch = new ObjectSchema();
    branch.title = "Variante 2";
    wrapper.addBranch(operator, branch);
    return compositionPath.length ? replaceNodeAtPath(root, compositionPath, wrapper) : wrapper;
  }

  const next = composition.clone() as CompositionSchema;
  const branch = new ObjectSchema();
  branch.title = `Variante ${next.getChildren().length + 1}`;
  next.addBranch(operator, branch);
  return replaceNodeAtPath(root, compositionPath, next);
}

export function setArrayItems(root: SchemaNode, arrayPath: SchemaPath, kind: string): SchemaNode {
  const array = getSchemaAtPath(root, arrayPath);
  if (!(array instanceof ArraySchema)) throw new Error("Kein Array");
  const next = array.clone() as ArraySchema;
  next.setItems(createSchemaByKind(kind));
  return replaceNodeAtPath(root, arrayPath, next);
}

export function getArrayItemsKind(array: ArraySchema): string | undefined {
  return array.items ? resolveSchemaDisplayKind(array.items) : undefined;
}

export function getArrayAtPath(root: SchemaNode, path: SchemaPath): ArraySchema | null {
  try {
    const node = getSchemaAtPath(root, path);
    return node instanceof ArraySchema ? node : null;
  } catch {
    return null;
  }
}

/** Pfad zum Array, wenn `path` auf items oder ein Item darunter zeigt. */
export function resolveArrayPathForItems(path: SchemaPath): SchemaPath | null {
  if (path.length === 0) return null;
  const last = path[path.length - 1];
  if (last === "items") return path.slice(0, -1);
  const itemsIndex = path.lastIndexOf("items");
  if (itemsIndex >= 0) return path.slice(0, itemsIndex);
  return null;
}

export function updateSchemaAtPath(
  root: SchemaNode,
  path: SchemaPath,
  updater: (node: SchemaNode) => void,
): SchemaNode {
  const node = getSchemaAtPath(root, path);
  const clone = node.clone();
  updater(clone);
  return replaceNodeAtPath(root, path, clone);
}

export function setPropertyRequired(
  root: SchemaNode,
  propertyPath: SchemaPath,
  required: boolean,
): SchemaNode {
  if (propertyPath.length === 0) return root;

  const name = propertyPath[propertyPath.length - 1];
  const objectPath = propertyPath.slice(0, -1);
  const object = getSchemaAtPath(root, objectPath);

  if (!(object instanceof ObjectSchema)) return root;

  const prop = object.getProperty(name);
  if (!prop) return root;

  const next = object.clone() as ObjectSchema;
  next.setProperty(name, prop.clone(), required);
  return replaceNodeAtPath(root, objectPath, next);
}

export function getPropertyParentPath(path: SchemaPath): SchemaPath | null {
  if (path.length === 0) return null;
  const last = path[path.length - 1];
  if (parseTupleBranchPath(path)) return path.slice(0, -2);
  if (last === "items" || last === "prefixItems") return path.slice(0, -1);
  if (last === "allOf" || last === "anyOf" || last === "oneOf") return null;
  if (/^\d+$/.test(last)) return path.slice(0, -1);
  return path.slice(0, -1);
}
