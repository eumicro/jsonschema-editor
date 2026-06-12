import { inject } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import {
  globalJsonSchemaAttributeRegistry,
  type JsonSchemaAttributeRegistry,
} from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  globalUiSchemaAttributeRegistry,
  type UiSchemaAttributeRegistry,
} from "@jsonschema-editor/ui-schema";
import type { AttributeControlRegistry } from "../registry/attribute-control-registry.js";
import type { TypeControlRegistry } from "../registry/type-registry.js";
import {
  JSON_SCHEMA_ATTRIBUTE_REGISTRY_KEY,
  SCHEMA_ATTRIBUTE_CONTROL_REGISTRY_KEY,
  SCHEMA_EDITOR_TYPE_REGISTRY_KEY,
  SCHEMA_FORM_TYPE_REGISTRY_KEY,
  UI_ATTRIBUTE_CONTROL_REGISTRY_KEY,
  UI_EDITOR_TYPE_REGISTRY_KEY,
  UI_FORM_TYPE_REGISTRY_KEY,
  UI_SCHEMA_ATTRIBUTE_REGISTRY_KEY,
  globalSchemaAttributeControlRegistry,
  globalSchemaEditorTypeRegistry,
  globalSchemaFormTypeRegistry,
  globalUiAttributeControlRegistry,
  globalUiEditorTypeRegistry,
  globalUiFormTypeRegistry,
} from "../registry/registries.js";

export function useSchemaFormTypeRegistry(): TypeControlRegistry<SchemaNode> {
  return inject(SCHEMA_FORM_TYPE_REGISTRY_KEY, globalSchemaFormTypeRegistry);
}

export function useSchemaEditorTypeRegistry(): TypeControlRegistry<SchemaNode> {
  return inject(SCHEMA_EDITOR_TYPE_REGISTRY_KEY, globalSchemaEditorTypeRegistry);
}

export function useUiFormTypeRegistry(): TypeControlRegistry<UiElement> {
  return inject(UI_FORM_TYPE_REGISTRY_KEY, globalUiFormTypeRegistry);
}

export function useUiEditorTypeRegistry(): TypeControlRegistry<UiElement> {
  return inject(UI_EDITOR_TYPE_REGISTRY_KEY, globalUiEditorTypeRegistry);
}

export function useSchemaAttributeControlRegistry(): AttributeControlRegistry<SchemaNode> {
  return inject(SCHEMA_ATTRIBUTE_CONTROL_REGISTRY_KEY, globalSchemaAttributeControlRegistry);
}

export function useUiAttributeControlRegistry(): AttributeControlRegistry<UiElement> {
  return inject(UI_ATTRIBUTE_CONTROL_REGISTRY_KEY, globalUiAttributeControlRegistry);
}

export function useJsonSchemaAttributeRegistry(): JsonSchemaAttributeRegistry {
  return inject(JSON_SCHEMA_ATTRIBUTE_REGISTRY_KEY, globalJsonSchemaAttributeRegistry);
}

export function useUiSchemaAttributeRegistry(): UiSchemaAttributeRegistry {
  return inject(UI_SCHEMA_ATTRIBUTE_REGISTRY_KEY, globalUiSchemaAttributeRegistry);
}
