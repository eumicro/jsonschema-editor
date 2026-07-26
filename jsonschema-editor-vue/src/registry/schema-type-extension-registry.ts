import type { SchemaNode } from "@jsonschema-editor/json-schema";

/** Custom schema type contributed by a Vue extension (not limited to string formats). */
export interface SchemaTypeExtensionDescriptor {
  id: string;
  /** Button / tree label (defaults to `id`). */
  label?: string;
  create: () => SchemaNode;
  /** Recognize an existing node as this type (labels, active state). */
  match?: (node: SchemaNode) => boolean;
  /**
   * When multiple extensions match the same node (e.g. computed + presentation),
   * the highest priority wins for the display/selected kind.
   */
  matchPriority?: number;
}

const registeredExtensions = new Map<string, SchemaTypeExtensionDescriptor>();

export function registerSchemaTypeExtension(descriptor: SchemaTypeExtensionDescriptor): void {
  if (registeredExtensions.has(descriptor.id)) return;
  registeredExtensions.set(descriptor.id, descriptor);
}

export function registerSchemaTypeExtensions(descriptors: SchemaTypeExtensionDescriptor[]): void {
  for (const descriptor of descriptors) {
    registerSchemaTypeExtension(descriptor);
  }
}

export function unregisterSchemaTypeExtension(id: string): void {
  registeredExtensions.delete(id);
}

export function listSchemaTypeExtensions(): SchemaTypeExtensionDescriptor[] {
  return [...registeredExtensions.values()];
}

export function getSchemaTypeExtension(id: string): SchemaTypeExtensionDescriptor | undefined {
  return registeredExtensions.get(id);
}

export function resolveSchemaTypeExtensionId(node: SchemaNode): string | undefined {
  let bestId: string | undefined;
  let bestPriority = Number.NEGATIVE_INFINITY;
  for (const extension of registeredExtensions.values()) {
    if (!extension.match?.(node)) continue;
    const priority = extension.matchPriority ?? 0;
    if (priority > bestPriority) {
      bestPriority = priority;
      bestId = extension.id;
    }
  }
  return bestId;
}

export function clearSchemaTypeExtensions(): void {
  registeredExtensions.clear();
}
