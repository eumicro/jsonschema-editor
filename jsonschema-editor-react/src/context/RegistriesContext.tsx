import { createContext, useContext, type ReactNode } from "react";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import type { JsonSchemaAttributeRegistry } from "@jsonschema-editor/json-schema";
import { globalJsonSchemaAttributeRegistry } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import type { UiSchemaAttributeRegistry } from "@jsonschema-editor/ui-schema";
import { globalUiSchemaAttributeRegistry } from "@jsonschema-editor/ui-schema";
import {
  globalSchemaAttributeControlRegistry,
  globalSchemaEditorTypeRegistry,
  globalSchemaFormTypeRegistry,
  globalUiAttributeControlRegistry,
  globalUiEditorTypeRegistry,
  globalUiFormTypeRegistry,
} from "../registry/registries.js";
import type { AttributeControlRegistry } from "../registry/attribute-control-registry.js";
import type { TypeControlRegistry } from "../registry/type-registry.js";

export interface RegistriesContextValue {
  schemaFormTypeRegistry: TypeControlRegistry<SchemaNode>;
  schemaEditorTypeRegistry: TypeControlRegistry<SchemaNode>;
  uiFormTypeRegistry: TypeControlRegistry<UiElement>;
  uiEditorTypeRegistry: TypeControlRegistry<UiElement>;
  schemaAttributeControlRegistry: AttributeControlRegistry<SchemaNode>;
  uiAttributeControlRegistry: AttributeControlRegistry<UiElement>;
  jsonSchemaAttributeRegistry: JsonSchemaAttributeRegistry;
  uiSchemaAttributeRegistry: UiSchemaAttributeRegistry;
}

const defaultRegistries: RegistriesContextValue = {
  schemaFormTypeRegistry: globalSchemaFormTypeRegistry,
  schemaEditorTypeRegistry: globalSchemaEditorTypeRegistry,
  uiFormTypeRegistry: globalUiFormTypeRegistry,
  uiEditorTypeRegistry: globalUiEditorTypeRegistry,
  schemaAttributeControlRegistry: globalSchemaAttributeControlRegistry,
  uiAttributeControlRegistry: globalUiAttributeControlRegistry,
  jsonSchemaAttributeRegistry: globalJsonSchemaAttributeRegistry,
  uiSchemaAttributeRegistry: globalUiSchemaAttributeRegistry,
};

const RegistriesContext = createContext<RegistriesContextValue>(defaultRegistries);

export function RegistriesProvider({
  value,
  children,
}: {
  value?: Partial<RegistriesContextValue>;
  children: ReactNode;
}) {
  const merged = { ...defaultRegistries, ...value };
  return <RegistriesContext.Provider value={merged}>{children}</RegistriesContext.Provider>;
}

export function useSchemaFormTypeRegistry(): TypeControlRegistry<SchemaNode> {
  return useContext(RegistriesContext).schemaFormTypeRegistry;
}

export function useSchemaEditorTypeRegistry(): TypeControlRegistry<SchemaNode> {
  return useContext(RegistriesContext).schemaEditorTypeRegistry;
}

export function useUiFormTypeRegistry(): TypeControlRegistry<UiElement> {
  return useContext(RegistriesContext).uiFormTypeRegistry;
}

export function useUiEditorTypeRegistry(): TypeControlRegistry<UiElement> {
  return useContext(RegistriesContext).uiEditorTypeRegistry;
}

export function useSchemaAttributeControlRegistry(): AttributeControlRegistry<SchemaNode> {
  return useContext(RegistriesContext).schemaAttributeControlRegistry;
}

export function useUiAttributeControlRegistry(): AttributeControlRegistry<UiElement> {
  return useContext(RegistriesContext).uiAttributeControlRegistry;
}

export function useJsonSchemaAttributeRegistry(): JsonSchemaAttributeRegistry {
  return useContext(RegistriesContext).jsonSchemaAttributeRegistry;
}

export function useUiSchemaAttributeRegistry(): UiSchemaAttributeRegistry {
  return useContext(RegistriesContext).uiSchemaAttributeRegistry;
}
