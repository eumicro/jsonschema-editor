import type { ComponentType } from "react";
import type { SchemaNode } from "@jsonschema-editor/json-schema";
import type { SchemaTypeExtensionDescriptor } from "./schema-type-extension-registry.js";
import {
  registerSchemaTypeExtension,
  unregisterSchemaTypeExtension,
} from "./schema-type-extension-registry.js";
import type { FormFieldMatchContext, FormFieldMatcher } from "./form-field-context.js";
import type { TypeControlRegistry } from "./type-registry.js";
import {
  globalSchemaEditorTypeRegistry,
  globalSchemaFormTypeRegistry,
} from "./registries.js";

export interface ReactFormFieldExtension {
  id: string;
  priority?: number;
  match: FormFieldMatcher;
  component: ComponentType<any>;
}

export type SchemaTypeExtension = SchemaTypeExtensionDescriptor;

export interface JseReactExtension {
  id: string;
  formFields?: ReactFormFieldExtension[];
  schemaTypes?: SchemaTypeExtension[];
}

export interface RegisterReactExtensionOptions {
  formRegistry?: TypeControlRegistry<SchemaNode>;
  editorRegistry?: TypeControlRegistry<SchemaNode>;
  includeEditor?: boolean;
}

const registeredExtensionIds = new Set<string>();
const registeredFieldIdsByExtension = new Map<string, string[]>();
const registeredSchemaTypeIdsByExtension = new Map<string, string[]>();

export function isReactExtensionRegistered(id: string): boolean {
  return registeredExtensionIds.has(id);
}

function registerFormFieldOnRegistry(
  registry: TypeControlRegistry<SchemaNode>,
  field: ReactFormFieldExtension,
): void {
  registry.registerMatch(
    (schema, context) => field.match(schema, context as FormFieldMatchContext),
    field.component,
    field.priority ?? 15,
    field.id,
  );
}

export function registerReactExtension(
  extension: JseReactExtension,
  options: RegisterReactExtensionOptions = {},
): void {
  if (registeredExtensionIds.has(extension.id)) return;

  const formRegistry = options.formRegistry ?? globalSchemaFormTypeRegistry;
  const editorRegistry = options.editorRegistry ?? globalSchemaEditorTypeRegistry;
  const includeEditor = options.includeEditor ?? true;
  const fieldIds: string[] = [];

  for (const field of extension.formFields ?? []) {
    registerFormFieldOnRegistry(formRegistry, field);
    fieldIds.push(field.id);
    if (includeEditor) {
      registerFormFieldOnRegistry(editorRegistry, field);
    }
  }

  const schemaTypeIds: string[] = [];
  for (const schemaType of extension.schemaTypes ?? []) {
    registerSchemaTypeExtension(schemaType);
    schemaTypeIds.push(schemaType.id);
  }

  registeredExtensionIds.add(extension.id);
  registeredFieldIdsByExtension.set(extension.id, fieldIds);
  registeredSchemaTypeIdsByExtension.set(extension.id, schemaTypeIds);
}

export function registerReactExtensions(
  extensions: JseReactExtension[],
  options?: RegisterReactExtensionOptions,
): void {
  for (const extension of extensions) {
    registerReactExtension(extension, options);
  }
}

export function unregisterReactExtension(
  id: string,
  options?: RegisterReactExtensionOptions,
): void {
  if (!registeredExtensionIds.has(id)) return;

  const formRegistry = options?.formRegistry ?? globalSchemaFormTypeRegistry;
  const editorRegistry = options?.editorRegistry ?? globalSchemaEditorTypeRegistry;
  const includeEditor = options?.includeEditor ?? true;

  for (const fieldId of registeredFieldIdsByExtension.get(id) ?? []) {
    formRegistry.unregister(fieldId);
    if (includeEditor) {
      editorRegistry.unregister(fieldId);
    }
  }

  for (const typeId of registeredSchemaTypeIdsByExtension.get(id) ?? []) {
    unregisterSchemaTypeExtension(typeId);
  }

  registeredExtensionIds.delete(id);
  registeredFieldIdsByExtension.delete(id);
  registeredSchemaTypeIdsByExtension.delete(id);
}

export function setupJseReactExtensions(extensions?: JseReactExtension[]): void {
  if (!extensions?.length) return;
  registerReactExtensions(extensions);
}
