import type { Component } from "vue";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
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

export interface VueFormFieldExtension {
  id: string;
  priority?: number;
  match: FormFieldMatcher;
  component: Component;
}

/**
 * Framework-agnostic form-data derivation hook.
 * Use for values that must stay in sync with other instance data
 * (e.g. `x-computed`) without owning the field UI.
 */
export interface FormDataSyncExtension {
  id: string;
  sync: (
    schema: SchemaDocument,
    data: Record<string, unknown>,
  ) => Record<string, unknown>;
}

export type SchemaTypeExtension = SchemaTypeExtensionDescriptor;

export interface JseVueExtension {
  id: string;
  formFields?: VueFormFieldExtension[];
  schemaTypes?: SchemaTypeExtension[];
  /** Optional instance-data sync plugins (computed values, future derived fields). */
  formDataSync?: FormDataSyncExtension[];
}

export interface RegisterVueExtensionOptions {
  formRegistry?: TypeControlRegistry<SchemaNode>;
  editorRegistry?: TypeControlRegistry<SchemaNode>;
  /** Also register on the schema editor preview registry. Default: true. */
  includeEditor?: boolean;
}

const registeredExtensionIds = new Set<string>();
const registeredFieldIdsByExtension = new Map<string, string[]>();
const registeredSchemaTypeIdsByExtension = new Map<string, string[]>();
const registeredFormDataSyncByExtension = new Map<string, FormDataSyncExtension[]>();

export function isVueExtensionRegistered(id: string): boolean {
  return registeredExtensionIds.has(id);
}

function registerFormFieldOnRegistry(
  registry: TypeControlRegistry<SchemaNode>,
  field: VueFormFieldExtension,
): void {
  registry.registerMatch(
    (schema, context) => field.match(schema, context as FormFieldMatchContext),
    field.component,
    field.priority ?? 15,
    field.id,
  );
}

export function registerVueExtension(
  extension: JseVueExtension,
  options: RegisterVueExtensionOptions = {},
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
  registeredFormDataSyncByExtension.set(extension.id, [...(extension.formDataSync ?? [])]);
}

export function registerVueExtensions(
  extensions: JseVueExtension[],
  options?: RegisterVueExtensionOptions,
): void {
  for (const extension of extensions) {
    registerVueExtension(extension, options);
  }
}

export function unregisterVueExtension(id: string, options?: RegisterVueExtensionOptions): void {
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
  registeredFormDataSyncByExtension.delete(id);
}

export function listRegisteredFormDataSyncExtensions(): FormDataSyncExtension[] {
  return [...registeredFormDataSyncByExtension.values()].flat();
}

/** Applies all registered form-data sync plugins. Returns `data` when unchanged. */
export function applyRegisteredFormDataSync(
  schema: SchemaDocument,
  data: Record<string, unknown>,
): Record<string, unknown> {
  let current = data;
  for (const syncer of listRegisteredFormDataSyncExtensions()) {
    current = syncer.sync(schema, current);
  }
  return current;
}

/** Call once at app startup or pass via `JsonSchemaForm` / `install()` extensions prop. */
export function setupJseVueExtensions(extensions?: JseVueExtension[]): void {
  if (!extensions?.length) return;
  registerVueExtensions(extensions);
}
