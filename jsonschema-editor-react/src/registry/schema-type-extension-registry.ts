import type { SchemaNode } from "@jsonschema-editor/json-schema";

export interface SchemaTypeExtensionDescriptor {
  id: string;
  label: string;
  create: () => SchemaNode;
  match: (node: SchemaNode) => boolean;
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
  for (const extension of registeredSchemaTypes.values()) {
    if (extension.match(node)) return extension.id;
  }
  return undefined;
}
