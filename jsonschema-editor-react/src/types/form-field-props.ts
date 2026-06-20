import type { ComponentType } from "react";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";

export interface FormFieldProps {
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
}

export interface UiElementRendererProps {
  element: UiElement;
  schema: SchemaNode;
  document?: SchemaDocument;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  readonly?: boolean;
}

export interface FormFieldRendererProps extends FormFieldProps {
  modelValue?: unknown;
}

export interface EditorAttributeRendererProps {
  schema: SchemaNode;
  attributeName: string;
  label: string;
  readonly?: boolean;
  modelValue?: unknown;
}

export interface EditorKindRendererProps {
  schema: SchemaNode;
  propertyName?: string;
  readonly?: boolean;
}

export type FormFieldComponent = ComponentType<FormFieldProps>;
export type UiElementComponent = ComponentType<UiElementRendererProps>;
