import {
  ArraySchema,
  CompositionSchema,
  ObjectSchema,
  RefSchema,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";
import { scopeToPath } from "../scope.js";

function resolveRefChain(
  node: SchemaNode,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): SchemaNode {
  let current = node;
  while (current instanceof RefSchema && resolveRef) {
    const resolved = resolveRef(current.ref);
    if (!resolved || resolved === current) break;
    current = resolved;
  }
  return current;
}

function isObjectSchemaNode(node: SchemaNode): node is ObjectSchema {
  return node.nodeKind === "object";
}

function isCompositionSchemaNode(node: SchemaNode): node is CompositionSchema {
  return node.nodeKind === "composition";
}

function preferRicherProperty(existing: SchemaNode, incoming: SchemaNode): SchemaNode {
  if (incoming.title && !existing.title) return incoming;
  if (existing.title && !incoming.title) return existing;

  if (existing instanceof ObjectSchema && incoming instanceof ObjectSchema) {
    if (incoming.propertyCount > existing.propertyCount) return incoming;
    if (existing.propertyCount > incoming.propertyCount) return existing;
  }

  return existing;
}

function mergeCompositionForScope(
  comp: CompositionSchema,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): ObjectSchema | undefined {
  const merged = new ObjectSchema();

  for (const branch of comp.branches) {
    let resolved = resolveRefChain(branch, resolveRef);
    if (resolved instanceof CompositionSchema) {
      resolved = mergeCompositionForScope(resolved, resolveRef) ?? resolved;
    }
    if (!isObjectSchemaNode(resolved)) continue;

    for (const [name, prop] of resolved.properties) {
      const existing = merged.getProperty(name);
      const next = existing ? preferRicherProperty(existing, prop) : prop;
      merged.setProperty(
        name,
        next,
        merged.isPropertyRequired(name) || resolved.isPropertyRequired(name),
      );
    }
  }

  return merged.propertyCount > 0 ? merged : undefined;
}

function isArraySchemaNode(node: SchemaNode): node is ArraySchema {
  return node.nodeKind === "array";
}

function descendArrayIndex(array: ArraySchema, index: number): SchemaNode | undefined {
  if (array.itemsMode === "tuple") {
    return array.getPrefixItem(index);
  }
  return array.items;
}

function descendForScope(
  current: SchemaNode,
  segment: string,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): SchemaNode | undefined {
  current = resolveRefChain(current, resolveRef);

  if (current instanceof CompositionSchema) {
    const merged = mergeCompositionForScope(current, resolveRef);
    if (merged) current = merged;
  }

  if (isArraySchemaNode(current) && /^\d+$/.test(segment)) {
    return descendArrayIndex(current, Number(segment));
  }

  if (!isObjectSchemaNode(current)) return undefined;
  const child = current.getProperty(segment);
  if (!child) return undefined;
  return child;
}

/** Resolves a JSON Schema node at a UI control scope, following intermediate `$ref`s. */
export function resolveSchemaAtScope(
  rootSchema: SchemaNode,
  scope: string,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): SchemaNode | undefined {
  const segments = scopeToPath(scope);
  if (segments.length === 0) {
    return resolveRefChain(rootSchema, resolveRef);
  }

  let current: SchemaNode = rootSchema;
  for (const segment of segments) {
    const next = descendForScope(current, segment, resolveRef);
    if (!next) return undefined;
    current = next;
  }

  return resolveRefChain(current, resolveRef);
}

function isVariantComposition(node: SchemaNode): node is CompositionSchema {
  return isCompositionSchemaNode(node) && (node.oneOf.length > 0 || node.anyOf.length > 0);
}

/** Liefert die oneOf-/anyOf-Komposition am UI-Scope (JSON-Forms-Muster). */
export function resolveCompositionAtScope(
  rootSchema: SchemaNode,
  scope: string,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): CompositionSchema | undefined {
  const segments = scopeToPath(scope);

  if (segments.length === 0) {
    const root = resolveRefChain(rootSchema, resolveRef);
    return isVariantComposition(root) ? root : undefined;
  }

  let current: SchemaNode = rootSchema;

  for (let i = 0; i < segments.length; i++) {
    const next = descendForScope(current, segments[i], resolveRef);
    if (!next) return undefined;
    current = next;
    if (i === segments.length - 1) {
      const resolved = resolveRefChain(current, resolveRef);
      return isVariantComposition(resolved) ? resolved : undefined;
    }
  }

  return undefined;
}
