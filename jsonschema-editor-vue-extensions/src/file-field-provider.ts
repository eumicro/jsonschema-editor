import { inject, provide, type InjectionKey } from "vue";
import type { FileFieldProvider } from "@jsonschema-editor/json-schema-extensions";
import { createInMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";

export const FILE_FIELD_PROVIDER_KEY: InjectionKey<FileFieldProvider> = Symbol("fileFieldProvider");

let fallbackProvider: FileFieldProvider | undefined;

function getFallbackFileFieldProvider(): FileFieldProvider {
  fallbackProvider ??= createInMemoryFileFieldProvider();
  return fallbackProvider;
}

/** Provide a custom file storage/preview implementation for descendant form fields. */
export function provideFileFieldProvider(provider: FileFieldProvider): void {
  provide(FILE_FIELD_PROVIDER_KEY, provider);
}

/** Resolve the active file provider (injected or in-memory fallback for demos). */
export function useFileFieldProvider(): FileFieldProvider {
  return inject(FILE_FIELD_PROVIDER_KEY, getFallbackFileFieldProvider());
}
