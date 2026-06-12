import type { InjectionKey } from "vue";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import type { JsonSchemaAttributeRegistry } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import type { UiSchemaAttributeRegistry } from "@jsonschema-editor/ui-schema";
import { TypeControlRegistry } from "./type-registry.js";
import { AttributeControlRegistry } from "./attribute-control-registry.js";

/** Formularfeld pro JSON-Schema-Knoten (Ausfüll-Modus). */
export const globalSchemaFormTypeRegistry = new TypeControlRegistry<SchemaNode>();

/** Editor-Panel pro JSON-Schema-Knoten (Struktur-Editor). */
export const globalSchemaEditorTypeRegistry = new TypeControlRegistry<SchemaNode>();

/** Formular-Renderer pro UI-Schema-Element. */
export const globalUiFormTypeRegistry = new TypeControlRegistry<UiElement>();

/** Editor-Panel pro UI-Schema-Element. */
export const globalUiEditorTypeRegistry = new TypeControlRegistry<UiElement>();

/** Attribut-Control im Schema-Editor. */
export const globalSchemaAttributeControlRegistry = new AttributeControlRegistry<SchemaNode>();

/** Attribut-Control im UI-Schema-Editor. */
export const globalUiAttributeControlRegistry = new AttributeControlRegistry<UiElement>();

export const SCHEMA_FORM_TYPE_REGISTRY_KEY: InjectionKey<TypeControlRegistry<SchemaNode>> =
  Symbol("schemaFormTypeRegistry");
export const SCHEMA_EDITOR_TYPE_REGISTRY_KEY: InjectionKey<TypeControlRegistry<SchemaNode>> =
  Symbol("schemaEditorTypeRegistry");
export const UI_FORM_TYPE_REGISTRY_KEY: InjectionKey<TypeControlRegistry<UiElement>> =
  Symbol("uiFormTypeRegistry");
export const UI_EDITOR_TYPE_REGISTRY_KEY: InjectionKey<TypeControlRegistry<UiElement>> =
  Symbol("uiEditorTypeRegistry");
export const SCHEMA_ATTRIBUTE_CONTROL_REGISTRY_KEY: InjectionKey<
  AttributeControlRegistry<SchemaNode>
> = Symbol("schemaAttributeControlRegistry");
export const UI_ATTRIBUTE_CONTROL_REGISTRY_KEY: InjectionKey<
  AttributeControlRegistry<UiElement>
> = Symbol("uiAttributeControlRegistry");
export const JSON_SCHEMA_ATTRIBUTE_REGISTRY_KEY: InjectionKey<JsonSchemaAttributeRegistry> =
  Symbol("jsonSchemaAttributeRegistry");
export const UI_SCHEMA_ATTRIBUTE_REGISTRY_KEY: InjectionKey<UiSchemaAttributeRegistry> =
  Symbol("uiSchemaAttributeRegistry");
