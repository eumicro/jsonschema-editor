import {
  ArraySchema,
  ObjectSchema,
  RefSchema,
  type SchemaDocument,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";

const IDENT = /^[A-Za-z_][\w]*$/;
const MAX_DEPTH = 24;

/** Index of schema field paths usable as CEL `data…` completions. */
export type CelDataPathIndex = {
  /** Absolute paths starting with `data`, e.g. `data.positionen`. */
  paths: string[];
  /** Direct child property names keyed by parent path (`data` for root fields). */
  childrenOf: ReadonlyMap<string, readonly string[]>;
  /** Object-item property names for array paths (use via `map(p, p.prop)`). */
  arrayItemProps: ReadonlyMap<string, readonly string[]>;
  /** Relative item property paths across all object-arrays (for `p.…` completion). */
  itemRelativePaths: readonly string[];
};

function isIdent(name: string): boolean {
  return IDENT.test(name);
}

function addChild(map: Map<string, Set<string>>, parent: string, child: string): void {
  let set = map.get(parent);
  if (!set) {
    set = new Set();
    map.set(parent, set);
  }
  set.add(child);
}

function resolveNode(
  node: SchemaNode,
  document: SchemaDocument | undefined,
  depth: number,
): SchemaNode {
  if (!(node instanceof RefSchema) || depth <= 0) return node;
  if (!document) return node;
  return document.resolveNode(node, depth);
}

function walkItemObject(
  node: SchemaNode,
  relativeParts: string[],
  document: SchemaDocument | undefined,
  itemPaths: Set<string>,
  stack: Set<SchemaNode>,
  depth: number,
): void {
  if (depth > MAX_DEPTH) return;
  const resolved = resolveNode(node, document, 8);
  if (stack.has(resolved)) return;
  stack.add(resolved);

  try {
    if (!(resolved instanceof ObjectSchema)) return;

    for (const [name, child] of resolved.properties) {
      if (!isIdent(name)) continue;
      const rel = [...relativeParts, name];
      itemPaths.add(rel.join("."));
      const next = resolveNode(child, document, 8);
      if (next instanceof ObjectSchema) {
        walkItemObject(next, rel, document, itemPaths, stack, depth + 1);
      } else if (next instanceof ArraySchema && next.items) {
        const items = resolveNode(next.items, document, 8);
        if (items instanceof ObjectSchema) {
          walkItemObject(items, rel, document, itemPaths, stack, depth + 1);
        }
      }
    }
  } finally {
    stack.delete(resolved);
  }
}

function walk(
  node: SchemaNode,
  pathParts: string[],
  document: SchemaDocument | undefined,
  childrenAcc: Map<string, Set<string>>,
  arrayItemAcc: Map<string, Set<string>>,
  pathSet: Set<string>,
  itemPaths: Set<string>,
  stack: Set<SchemaNode>,
  depth: number,
): void {
  if (depth > MAX_DEPTH) return;
  const resolved = resolveNode(node, document, 8);
  if (stack.has(resolved)) return;
  stack.add(resolved);

  try {
    const parentPath = pathParts.length === 0 ? "data" : ["data", ...pathParts].join(".");
    if (pathParts.length > 0) {
      pathSet.add(parentPath);
    }

    if (resolved instanceof ObjectSchema) {
      for (const [name, child] of resolved.properties) {
        if (!isIdent(name)) continue;
        addChild(childrenAcc, parentPath, name);
        walk(
          child,
          [...pathParts, name],
          document,
          childrenAcc,
          arrayItemAcc,
          pathSet,
          itemPaths,
          stack,
          depth + 1,
        );
      }
      return;
    }

    if (resolved instanceof ArraySchema) {
      const items = resolved.items ? resolveNode(resolved.items, document, 8) : undefined;
      if (!(items instanceof ObjectSchema)) return;
      const itemPropSet = new Set<string>();
      for (const [name] of items.properties) {
        if (!isIdent(name)) continue;
        itemPropSet.add(name);
      }
      if (itemPropSet.size > 0) {
        arrayItemAcc.set(parentPath, itemPropSet);
      }
      walkItemObject(items, [], document, itemPaths, new Set(), depth + 1);
    }
  } finally {
    stack.delete(resolved);
  }
}

/** Build a completion index from the document root schema. */
export function collectCelDataPathIndex(document: SchemaDocument): CelDataPathIndex {
  const childrenAcc = new Map<string, Set<string>>();
  const arrayItemAcc = new Map<string, Set<string>>();
  const pathSet = new Set<string>();
  const itemPaths = new Set<string>();
  walk(document.root, [], document, childrenAcc, arrayItemAcc, pathSet, itemPaths, new Set(), 0);

  const childrenOf = new Map<string, readonly string[]>();
  for (const [key, set] of childrenAcc) {
    childrenOf.set(key, [...set].sort((a, b) => a.localeCompare(b)));
  }
  const arrayItemProps = new Map<string, readonly string[]>();
  for (const [key, set] of arrayItemAcc) {
    arrayItemProps.set(key, [...set].sort((a, b) => a.localeCompare(b)));
  }

  return {
    paths: [...pathSet].sort((a, b) => a.localeCompare(b)),
    childrenOf,
    arrayItemProps,
    itemRelativePaths: [...itemPaths].sort((a, b) => a.localeCompare(b)),
  };
}

export function emptyCelDataPathIndex(): CelDataPathIndex {
  return {
    paths: [],
    childrenOf: new Map(),
    arrayItemProps: new Map(),
    itemRelativePaths: [],
  };
}
