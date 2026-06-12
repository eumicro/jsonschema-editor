import {
  CompositionSchema,
  ObjectSchema,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";
import { scopeToPath } from "../scope.js";

function isVariantComposition(node: SchemaNode): node is CompositionSchema {
  return (
    node instanceof CompositionSchema && (node.oneOf.length > 0 || node.anyOf.length > 0)
  );
}

function descendForScope(current: SchemaNode, segment: string): SchemaNode | undefined {
  if (current instanceof CompositionSchema) {
    const merged = current.mergeToObject();
    if (merged) current = merged;
  }
  if (!(current instanceof ObjectSchema)) return undefined;
  return current.getProperty(segment);
}

/** Liefert die oneOf-/anyOf-Komposition am UI-Scope (JSON-Forms-Muster). */
export function resolveCompositionAtScope(
  rootSchema: SchemaNode,
  scope: string,
): CompositionSchema | undefined {
  const segments = scopeToPath(scope);

  if (segments.length === 0) {
    return isVariantComposition(rootSchema) ? rootSchema : undefined;
  }

  let current: SchemaNode = rootSchema;

  for (let i = 0; i < segments.length; i++) {
    const next = descendForScope(current, segments[i]);
    if (!next) return undefined;
    current = next;
    if (i === segments.length - 1 && isVariantComposition(current)) {
      return current;
    }
  }

  return undefined;
}
