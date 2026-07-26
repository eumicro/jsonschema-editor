import type { ComponentType } from "react";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import type { ElementLabelProp } from "../utils/array-item-label.js";

export interface FormFieldProps {
  schema: SchemaNode;
  document?: SchemaDocument;
  scope: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  /** JSON Forms `options.detail` for array item UI (when resolved to ArrayFormField). */
  detail?: UiElement;
  /** JSON Forms `options.elementLabelProp`. */
  elementLabelProp?: ElementLabelProp;
  /** Full Control options (fallback for elementLabelProp). */
  controlOptions?: Readonly<Record<string, unknown>>;
}

export interface UiElementRendererProps {
  element: UiElement;
  schema: SchemaNode;
  document?: SchemaDocument;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  readonly?: boolean;
  /** Absolute scope prefix when rendering nested `options.detail`. */
  scopePrefix?: string;
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
