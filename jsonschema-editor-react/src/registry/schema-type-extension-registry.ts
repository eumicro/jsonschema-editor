import type { SchemaNode } from "@jsonschema-editor/json-schema";

export interface SchemaTypeExtensionDescriptor {
  id: string;
  label: string;
  create: () => SchemaNode;
  match: (node: SchemaNode) => boolean;
  /**
   * When multiple extensions match the same node (e.g. computed + presentation),
   * the highest priority wins for the display/selected kind.
   */
  matchPriority?: number;
}

const registeredSchemaTypes = new Map<string, SchemaTypeExtensionDescriptor>();

export function registerSchemaTypeExtension(descriptor: SchemaTypeExtensionDescriptor): void {
  registeredSchemaTypes.set(descriptor.id, descriptor);
}

export function unregisterSchemaTypeExtension(id: string): void {
  registeredSchemaTypes.delete(id);
}

export function listSchemaTypeExtensions(): readonly SchemaTypeExtensionDescriptor[] {
  return [...registeredSchemaTypes.values()];
}

export function getSchemaTypeExtension(id: string): SchemaTypeExtensionDescriptor | undefined {
  return registeredSchemaTypes.get(id);
}

export function resolveSchemaTypeExtensionId(node: SchemaNode): string | undefined {
  let bestId: string | undefined;
  let bestPriority = Number.NEGATIVE_INFINITY;
  for (const extension of registeredSchemaTypes.values()) {
    if (!extension.match(node)) continue;
    const priority = extension.matchPriority ?? 0;
    if (priority > bestPriority) {
      bestPriority = priority;
      bestId = extension.id;
    }
  }
  return bestId;
}
