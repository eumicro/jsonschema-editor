import {
  globalJsonSchemaAttributeRegistry,
  type JsonSchemaAttributeRegistry,
  type SchemaNode,
} from "@jsonschema-editor/json-schema";

export const READ_ONLY_ATTRIBUTE = "x-read-only";
export const HIDDEN_ATTRIBUTE = "x-hidden";

function deserializeBooleanFlag(raw: unknown): boolean {
  return raw === true;
}

function serializeBooleanFlag(value: boolean): unknown {
  return value ? true : undefined;
}

const fieldFlagDefinitions = [
  {
    name: READ_ONLY_ATTRIBUTE,
    scope: "field" as const,
    defaultValue: false,
    deserialize: deserializeBooleanFlag,
    serialize: serializeBooleanFlag,
  },
  {
    name: HIDDEN_ATTRIBUTE,
    scope: "field" as const,
    defaultValue: false,
    deserialize: deserializeBooleanFlag,
    serialize: serializeBooleanFlag,
  },
];

/** Registers boolean field flags that apply to every schema field type. */
export function registerFieldFlagAttributes(
  registry: JsonSchemaAttributeRegistry = globalJsonSchemaAttributeRegistry,
): JsonSchemaAttributeRegistry {
  for (const definition of fieldFlagDefinitions) {
    if (!registry.isRegistered(definition.name)) {
      registry.register(definition);
    }
  }
  return registry;
}

export function readFieldBooleanFlag(node: SchemaNode | undefined, name: string): boolean {
  if (!node) return false;
  return node.getCustomAttribute<boolean>(name) === true;
}

export function isFieldReadOnly(node: SchemaNode | undefined): boolean {
  return readFieldBooleanFlag(node, READ_ONLY_ATTRIBUTE);
}

export function isFieldHidden(node: SchemaNode | undefined): boolean {
  return readFieldBooleanFlag(node, HIDDEN_ATTRIBUTE);
}

export function setFieldBooleanFlag(node: SchemaNode, name: string, value: boolean): void {
  if (value) {
    node.setCustomAttribute(name, true);
  } else {
    node.deleteCustomAttribute(name);
  }
}

registerFieldFlagAttributes(globalJsonSchemaAttributeRegistry);
