import { listSchemaTypeExtensions } from "../registry/schema-type-extension-registry.js";
import {
  ARRAY_ITEM_TYPE_KINDS,
  OBJECT_PROPERTY_KINDS,
  PRIMITIVE_SCHEMA_KINDS,
  STRING_FORMAT_SCHEMA_KINDS,
  COMPOSITE_SCHEMA_KINDS,
} from "./schema-type-kinds";

export interface SchemaEditorTypeOption {
  id: string;
  label: string;
}

function toOption(id: string, label?: string): SchemaEditorTypeOption {
  return { id, label: label ?? id };
}

export function listExtensionTypeOptions(): SchemaEditorTypeOption[] {
  return listSchemaTypeExtensions().map((extension) =>
    toOption(extension.id, extension.label),
  );
}

export function listObjectPropertyTypeOptions(): SchemaEditorTypeOption[] {
  return [
    ...OBJECT_PROPERTY_KINDS.map((id) => toOption(id)),
    ...listExtensionTypeOptions(),
  ];
}

export function listSchemaChangeTypeOptions(): SchemaEditorTypeOption[] {
  return listObjectPropertyTypeOptions();
}

export function listArrayItemTypeOptions(): SchemaEditorTypeOption[] {
  return [
    ...ARRAY_ITEM_TYPE_KINDS.map((id) => toOption(id)),
    ...listExtensionTypeOptions(),
  ];
}

export {
  PRIMITIVE_SCHEMA_KINDS,
  STRING_FORMAT_SCHEMA_KINDS,
  COMPOSITE_SCHEMA_KINDS,
};
