import {
  ArraySchema,
  ObjectSchema,
  getValueAtPath,
  setValueAtPath,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";
import { evaluateComputedExpression } from "./computed-cel.js";
import { readComputedConfig } from "./computed.js";

export interface ComputedFieldBinding {
  /** Instance data path segments (property names / array indices). */
  path: readonly string[];
  expression: string;
}

/**
 * Collects `x-computed` bindings under a schema subtree.
 * Array item paths are expanded from the current instance data.
 */
export function collectComputedFieldBindings(
  node: SchemaNode,
  data: unknown = undefined,
  path: readonly string[] = [],
): ComputedFieldBinding[] {
  const bindings: ComputedFieldBinding[] = [];
  const config = readComputedConfig(node);
  if (config && path.length > 0) {
    bindings.push({ path: [...path], expression: config.expression });
  }

  if (node instanceof ObjectSchema) {
    const record =
      data !== null && typeof data === "object" && !Array.isArray(data)
        ? (data as Record<string, unknown>)
        : undefined;
    for (const [name, property] of node.properties) {
      bindings.push(
        ...collectComputedFieldBindings(property, record?.[name], [...path, name]),
      );
    }
    return bindings;
  }

  if (node instanceof ArraySchema && node.items) {
    const items = Array.isArray(data) ? data : [];
    for (let index = 0; index < items.length; index++) {
      bindings.push(
        ...collectComputedFieldBindings(node.items, items[index], [...path, String(index)]),
      );
    }
  }

  return bindings;
}

function valuesEqual(left: unknown, right: unknown): boolean {
  return Object.is(left, right);
}

/**
 * Evaluates all `x-computed` expressions and writes results into form data.
 * Returns the original `data` reference when nothing changed.
 *
 * Presentation is intentionally separate: any matching form field (number,
 * progress-bar, enum, custom, …) can render the stored value.
 */
export function syncComputedFormData(
  root: SchemaNode,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const bindings = collectComputedFieldBindings(root, data);
  if (bindings.length === 0) {
    return data;
  }

  let current = data;
  const maxPasses = bindings.length + 1;

  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;
    let next = current;

    for (const binding of bindings) {
      const result = evaluateComputedExpression(binding.expression, next);
      if (!result.ok) {
        continue;
      }
      const existing = getValueAtPath(next, binding.path);
      if (!valuesEqual(existing, result.value)) {
        next = setValueAtPath(next, binding.path, result.value);
        changed = true;
      }
    }

    if (!changed) {
      return next;
    }
    current = next;
  }

  return current;
}
