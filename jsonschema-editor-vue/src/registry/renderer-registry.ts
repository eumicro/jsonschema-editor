import type { Component, InjectionKey, Ref } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import {
  globalSchemaAttributeControlRegistry,
  globalSchemaEditorTypeRegistry,
  globalSchemaFormTypeRegistry,
  globalUiAttributeControlRegistry,
  globalUiEditorTypeRegistry,
  globalUiFormTypeRegistry,
} from "./registries.js";
import type { AttributeControlRegistry } from "./attribute-control-registry.js";
import type { TypeControlRegistry } from "./type-registry.js";

export const RENDERER_REGISTRY_KEY: InjectionKey<RendererRegistry> = Symbol("rendererRegistry");
export const EDITOR_CONTEXT_KEY: InjectionKey<EditorContext> = Symbol("editorContext");

export interface FormFieldRendererProps {
  schema: SchemaNode;
  scope: string;
  label?: string;
  readonly?: boolean;
}

export interface EditorAttributeRendererProps {
  schema: SchemaNode;
  attributeName: string;
  label: string;
  readonly?: boolean;
}

export interface EditorKindRendererProps {
  schema: SchemaNode;
  propertyName?: string;
  readonly?: boolean;
}

export type FormFieldRenderer = Component<FormFieldRendererProps & { modelValue?: unknown }>;
export type EditorAttributeRenderer = Component<
  EditorAttributeRendererProps & { modelValue?: unknown }
>;
export type EditorKindRenderer = Component<EditorKindRendererProps>;

/**
 * Abwärtskompatibel: delegiert an die neuen Type-/Attribute-Control-Registries.
 * Bevorzugt direkt `TypeControlRegistry` / `AttributeControlRegistry` nutzen.
 */
export class RendererRegistry {
  constructor(
    private readonly schemaFormTypes: TypeControlRegistry<SchemaNode> = globalSchemaFormTypeRegistry,
    private readonly schemaEditorTypes: TypeControlRegistry<SchemaNode> = globalSchemaEditorTypeRegistry,
    private readonly schemaAttributes: AttributeControlRegistry<SchemaNode> = globalSchemaAttributeControlRegistry,
  ) {}

  registerFormKind(kind: string, renderer: FormFieldRenderer): this {
    this.schemaFormTypes.registerKind(kind, renderer);
    return this;
  }

  registerFormAttribute(name: string, renderer: FormFieldRenderer): this {
    this.schemaAttributes.registerName(name, renderer as EditorAttributeRenderer);
    return this;
  }

  registerEditorKind(kind: string, renderer: EditorKindRenderer): this {
    this.schemaEditorTypes.registerKind(kind, renderer);
    return this;
  }

  registerEditorAttribute(name: string, renderer: EditorAttributeRenderer): this {
    this.schemaAttributes.registerName(name, renderer);
    return this;
  }

  registerFormInstanceOf(
    ctor: abstract new (...args: never[]) => SchemaNode,
    renderer: FormFieldRenderer,
    priority?: number,
  ): this {
    this.schemaFormTypes.registerInstanceOf(ctor, renderer, { priority });
    return this;
  }

  registerFormMatch(
    match: (schema: SchemaNode) => boolean,
    renderer: FormFieldRenderer,
    priority?: number,
  ): this {
    this.schemaFormTypes.registerMatch(match, renderer, priority);
    return this;
  }

  setDefaultFormRenderer(renderer: FormFieldRenderer): this {
    this.schemaFormTypes.setDefault(renderer);
    return this;
  }

  setDefaultEditorKindRenderer(renderer: EditorKindRenderer): this {
    this.schemaEditorTypes.setDefault(renderer);
    return this;
  }

  setDefaultEditorAttributeRenderer(renderer: EditorAttributeRenderer): this {
    this.schemaAttributes.setDefault(renderer);
    return this;
  }

  resolveFormRenderer(schema: SchemaNode, attributeName?: string): FormFieldRenderer | null {
    if (attributeName) {
      const byAttr = this.schemaAttributes.resolve({
        node: schema,
        attributeName,
        label: attributeName,
        value: undefined,
      });
      if (byAttr) return byAttr as FormFieldRenderer;
    }

    return this.schemaFormTypes.resolve(schema) as FormFieldRenderer | null;
  }

  resolveEditorKindRenderer(schema: SchemaNode): EditorKindRenderer | null {
    return this.schemaEditorTypes.resolve(schema) as EditorKindRenderer | null;
  }

  resolveEditorAttributeRenderer(attributeName: string): EditorAttributeRenderer | null {
    return this.schemaAttributes.resolve({
      node: {} as SchemaNode,
      attributeName,
      label: attributeName,
      value: undefined,
    }) as EditorAttributeRenderer | null;
  }

  /** Direkter Zugriff auf die Typ-Registry (Formular). */
  get schemaFormTypeRegistry(): TypeControlRegistry<SchemaNode> {
    return this.schemaFormTypes;
  }

  /** Direkter Zugriff auf die Typ-Registry (Editor). */
  get schemaEditorTypeRegistry(): TypeControlRegistry<SchemaNode> {
    return this.schemaEditorTypes;
  }

  /** Direkter Zugriff auf die Attribut-Registry (Schema). */
  get schemaAttributeControlRegistry(): AttributeControlRegistry<SchemaNode> {
    return this.schemaAttributes;
  }

  /** UI-Formular-Typen. */
  get uiFormTypeRegistry(): TypeControlRegistry<UiElement> {
    return globalUiFormTypeRegistry;
  }

  /** UI-Editor-Typen. */
  get uiEditorTypeRegistry(): TypeControlRegistry<UiElement> {
    return globalUiEditorTypeRegistry;
  }

  /** UI-Attribut-Controls. */
  get uiAttributeControlRegistry(): AttributeControlRegistry<UiElement> {
    return globalUiAttributeControlRegistry;
  }
}

export const globalRendererRegistry = new RendererRegistry();

export interface EditorContext {
  document: Ref<SchemaDocument>;
  schema: Ref<SchemaNode>;
  uiSchema: Ref<UiSchema>;
  updateDocument: (next: SchemaDocument) => void;
  updateSchema: (next: SchemaDocument) => void;
  updateUiSchema: (next: UiSchema, manual?: boolean) => void;
}

export type { TypeControlRegistry, TypeMatcher, TypeControlRegistration } from "./type-registry.js";
export type {
  AttributeControlRegistry,
  AttributeMatcher,
  AttributeControlContext,
  AttributeControlRegistration,
} from "./attribute-control-registry.js";
export {
  globalSchemaFormTypeRegistry,
  globalSchemaEditorTypeRegistry,
  globalUiFormTypeRegistry,
  globalUiEditorTypeRegistry,
  globalSchemaAttributeControlRegistry,
  globalUiAttributeControlRegistry,
  SCHEMA_FORM_TYPE_REGISTRY_KEY,
  SCHEMA_EDITOR_TYPE_REGISTRY_KEY,
  UI_FORM_TYPE_REGISTRY_KEY,
  UI_EDITOR_TYPE_REGISTRY_KEY,
  SCHEMA_ATTRIBUTE_CONTROL_REGISTRY_KEY,
  UI_ATTRIBUTE_CONTROL_REGISTRY_KEY,
  JSON_SCHEMA_ATTRIBUTE_REGISTRY_KEY,
  UI_SCHEMA_ATTRIBUTE_REGISTRY_KEY,
} from "./registries.js";
