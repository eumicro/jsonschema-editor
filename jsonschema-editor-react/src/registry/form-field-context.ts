import type { SchemaNode } from "@jsonschema-editor/json-schema";
import { StringSchema } from "@jsonschema-editor/json-schema";

export interface FormFieldMatchContext {
  scope: string;
  propertyName?: string;
  label?: string;
  i18nKey?: string;
  readonly?: boolean;
  fieldSchema?: SchemaNode;
  rootSchema?: SchemaNode;
}

export type FormFieldMatcher = (schema: SchemaNode, context: FormFieldMatchContext) => boolean;

export function scopePropertyName(scope: string | undefined): string | undefined {
  if (!scope) return undefined;
  const match = scope.match(/\/([^/]+)$/);
  return match?.[1];
}

export function fieldStringSchema(
  schema: SchemaNode,
  context?: FormFieldMatchContext,
): StringSchema | null {
  const node = context?.fieldSchema ?? schema;
  return node instanceof StringSchema ? node : null;
}

export function matchStringFormat(...formats: string[]): FormFieldMatcher {
  return (schema, context) => {
    const node = fieldStringSchema(schema, context);
    if (!node?.format) return false;
    return formats.includes(node.format);
  };
}

export function matchPropertyName(...names: string[]): FormFieldMatcher {
  return (_schema, context) => {
    const name = context.propertyName ?? scopePropertyName(context.scope);
    return name !== undefined && names.includes(name);
  };
}

export function matchMinLength(minLength: number): FormFieldMatcher {
  return (schema, context) => {
    const node = fieldStringSchema(schema, context);
    return node?.minLength !== undefined && node.minLength >= minLength;
  };
}

export function matchSchemaKind(...kinds: string[]): FormFieldMatcher {
  return (schema) => kinds.includes(schema.kind);
}

export function matchCustomAttribute(
  name: string,
  predicate?: (value: unknown) => boolean,
): FormFieldMatcher {
  return (schema, context) => {
    const node = context?.fieldSchema ?? schema;
    const value = node.getCustomAttribute(name);
    if (value === undefined) return false;
    return predicate ? predicate(value) : true;
  };
}

export function createFormFieldMatchContext(
  partial: FormFieldMatchContext,
): FormFieldMatchContext {
  return {
    ...partial,
    propertyName: partial.propertyName ?? scopePropertyName(partial.scope),
  };
}
