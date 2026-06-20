import type { SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { TypeControlRegistry } from "./type-registry.js";
import { AttributeControlRegistry } from "./attribute-control-registry.js";

export const globalSchemaFormTypeRegistry = new TypeControlRegistry<SchemaNode>();
export const globalSchemaEditorTypeRegistry = new TypeControlRegistry<SchemaNode>();
export const globalUiFormTypeRegistry = new TypeControlRegistry<UiElement>();
export const globalUiEditorTypeRegistry = new TypeControlRegistry<UiElement>();
export const globalSchemaAttributeControlRegistry = new AttributeControlRegistry<SchemaNode>();
export const globalUiAttributeControlRegistry = new AttributeControlRegistry<UiElement>();
