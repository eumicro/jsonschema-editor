import { createContext, useContext, type ReactNode } from "react";
import type { FileFieldProvider } from "@jsonschema-editor/json-schema-extensions";
import { createInMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";

const FileFieldProviderContext = createContext<FileFieldProvider | null>(null);

let fallbackProvider: FileFieldProvider | undefined;

function getFallbackFileFieldProvider(): FileFieldProvider {
  fallbackProvider ??= createInMemoryFileFieldProvider();
  return fallbackProvider;
}

export interface FileFieldProviderProps {
  provider: FileFieldProvider;
  children: ReactNode;
}

/** Provide a custom file storage/preview implementation for descendant form fields. */
export function FileFieldProvider({ provider, children }: FileFieldProviderProps) {
  return (
    <FileFieldProviderContext.Provider value={provider}>{children}</FileFieldProviderContext.Provider>
  );
}

/** Resolve the active file provider (injected or in-memory fallback for demos). */
export function useFileFieldProvider(): FileFieldProvider {
  return useContext(FileFieldProviderContext) ?? getFallbackFileFieldProvider();
}

export { FileFieldProviderContext as FILE_FIELD_PROVIDER_KEY };
