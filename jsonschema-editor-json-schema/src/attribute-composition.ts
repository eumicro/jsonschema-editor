import type { JsonSchemaAttributeRegistry } from "./attribute-registry.js";
import type { SchemaNode } from "./model/node.js";
import type { AttributeOfferKind } from "./types.js";

function cloneAttributeValue<T>(value: T): T {
  return structuredClone(value);
}

function isOfferKind(kind: string): kind is AttributeOfferKind {
  return kind === "string" || kind === "number" || kind === "integer" || kind === "boolean";
}

/**
 * After a schema-type change, keep compatible custom attributes from the previous node.
 *
 * - Always prefer prior values for attributes already created on `to` (e.g. keep CEL expression).
 * - Always preserve field-scoped flags (`x-read-only`, …).
 * - When `preserveOffered` is true (target is an extension schema type), also copy offered
 *   composable attributes that do not conflict with exclusivity rules.
 */
export function transferCompatibleCustomAttributes(
  from: SchemaNode,
  to: SchemaNode,
  registry: JsonSchemaAttributeRegistry,
  options: { preserveOffered: boolean },
): void {
  const createdNames = new Set(to.listCustomAttributeNames());

  for (const name of createdNames) {
    const fromValue = from.getCustomAttribute(name);
    if (fromValue !== undefined) {
      to.setCustomAttribute(name, cloneAttributeValue(fromValue));
    }
  }

  for (const definition of registry.listFieldScoped()) {
    if (to.getCustomAttribute(definition.name) !== undefined) continue;
    const value = from.getCustomAttribute(definition.name);
    if (value !== undefined) {
      to.setCustomAttribute(definition.name, cloneAttributeValue(value));
    }
  }

  if (options.preserveOffered && isOfferKind(to.kind)) {
    for (const definition of registry.listOfferedForKind(to.kind)) {
      if (to.getCustomAttribute(definition.name) !== undefined) continue;
      const value = from.getCustomAttribute(definition.name);
      if (value === undefined) continue;
      const blocked = (definition.composition?.exclusiveWith ?? []).some(
        (exclusive) => to.getCustomAttribute(exclusive) !== undefined,
      );
      if (blocked) continue;
      to.setCustomAttribute(definition.name, cloneAttributeValue(value));
    }
  }

  enforceExclusiveCustomAttributes(to, registry, createdNames);
}

/**
 * Drop mutually exclusive peers. Attributes in `preferredNames` (typically from `create()`)
 * win over copied ones.
 */
export function enforceExclusiveCustomAttributes(
  node: SchemaNode,
  registry: JsonSchemaAttributeRegistry,
  preferredNames: ReadonlySet<string> = new Set(),
): void {
  for (const name of node.listCustomAttributeNames()) {
    const definition = registry.get(name);
    for (const exclusive of definition?.composition?.exclusiveWith ?? []) {
      if (node.getCustomAttribute(exclusive) === undefined) continue;
      if (preferredNames.has(name) && !preferredNames.has(exclusive)) {
        node.deleteCustomAttribute(exclusive);
      } else if (preferredNames.has(exclusive) && !preferredNames.has(name)) {
        node.deleteCustomAttribute(name);
      } else {
        node.deleteCustomAttribute(exclusive);
      }
    }
  }
}

/** Apply exclusivity when writing a custom attribute value onto a node. */
export function applyCustomAttributeWithComposition(
  node: SchemaNode,
  registry: JsonSchemaAttributeRegistry,
  name: string,
  value: unknown,
): void {
  if (value === undefined || value === null) {
    node.deleteCustomAttribute(name);
    return;
  }

  const definition = registry.get(name);
  for (const exclusive of definition?.composition?.exclusiveWith ?? []) {
    node.deleteCustomAttribute(exclusive);
  }
  node.setCustomAttribute(name, value);
}
