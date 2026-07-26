import {
  ArraySchema,
  CompositionSchema,
  ObjectSchema,
  RefSchema,
  type SchemaDocument,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";
import { resolveSchemaAtScope } from "./scope-resolution.js";

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

/**
 * Schema that a Control's `options.detail` UI Schema describes:
 * - array → item schema (object / $ref object)
 * - object / $ref object → that object
 *
 * Primitives and bare oneOf/anyOf roots return `undefined` (no detail UI).
 */
export function resolveControlDetailSchema(
  document: SchemaDocument | undefined | null,
  controlScope: string,
): SchemaNode | undefined {
  if (!document) return undefined;
  const resolveRef = (ref: string) => document.resolveRef(ref);
  const node = resolveSchemaAtScope(document.root, controlScope, resolveRef);
  if (!node) return undefined;

  const resolved = resolveRefChain(node, resolveRef);

  if (resolved instanceof ArraySchema) {
    if (resolved.itemsMode === "tuple") return undefined;
    const items = resolved.items;
    if (!items) return undefined;
    return asDetailObjectSchema(resolveRefChain(items, resolveRef), resolveRef);
  }

  return asDetailObjectSchema(resolved, resolveRef);
}

function asDetailObjectSchema(
  node: SchemaNode,
  resolveRef?: (ref: string) => SchemaNode | undefined,
): SchemaNode | undefined {
  if (node instanceof ObjectSchema) return node;
  if (node instanceof CompositionSchema) {
    // Merged property surface for $defs branches (allOf / oneOf property union).
    const merged = new ObjectSchema();
    const branches = [...node.allOf, ...node.oneOf, ...node.anyOf];
    for (const branch of branches) {
      const resolved = resolveRefChain(branch, resolveRef);
      if (!(resolved instanceof ObjectSchema)) continue;
      for (const [name, prop] of resolved.properties) {
        if (!merged.getProperty(name)) {
          merged.setProperty(name, prop, resolved.isPropertyRequired(name));
        }
      }
    }
    return merged.propertyCount > 0 ? merged : undefined;
  }
  return undefined;
}

export function controlSupportsDetail(
  document: SchemaDocument | undefined | null,
  controlScope: string,
): boolean {
  return resolveControlDetailSchema(document, controlScope) !== undefined;
}
