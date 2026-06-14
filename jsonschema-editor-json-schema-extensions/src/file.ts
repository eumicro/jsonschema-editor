import type { JsonSchemaAttributeRegistry, SchemaNode } from "@jsonschema-editor/json-schema";
import {
  ArraySchema,
  IntegerSchema,
  ObjectSchema,
  StringSchema,
} from "@jsonschema-editor/json-schema";
import { defaultExtensionsRegistry } from "./registry.js";

export const FILE_ATTRIBUTE = "x-file";

/** Serializable file reference stored in form JSON (bytes live in the provider). */
export interface FileDescriptor {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface FileFieldContext {
  /** JSON Forms scope of the control, e.g. #/properties/photo */
  scope: string;
}

/**
 * Application-provided persistence and preview for `x-file` fields.
 * The editor only calls these methods; it does not implement storage.
 */
export interface FileFieldProvider {
  store(
    file: Blob,
    meta: Pick<FileDescriptor, "name" | "mimeType" | "size">,
    context: FileFieldContext,
  ): Promise<FileDescriptor>;
  load(descriptor: FileDescriptor, context: FileFieldContext): Promise<Blob>;
  delete(descriptor: FileDescriptor, context: FileFieldContext): Promise<void>;
  /** Optional thumbnail URL (e.g. object URL or CDN) for previewable formats. */
  renderThumbnail?(
    descriptor: FileDescriptor,
    context: FileFieldContext,
  ): Promise<string | undefined>;
}

export interface FileExtensionConfig {
  /** Allow selecting more than one file. Default: false. */
  multiple?: boolean;
  /** MIME types or patterns, e.g. `image/*`, `application/pdf`. */
  accept?: string[];
  /** Maximum file size in bytes per file. */
  maxSize?: number;
  /** Maximum number of files when `multiple` is true. Default: 10. */
  maxFiles?: number;
}

export interface NormalizedFileConfig {
  multiple: boolean;
  accept: string[];
  maxSize?: number;
  maxFiles: number;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isFileExtensionConfig(value: unknown): value is FileExtensionConfig {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.multiple !== undefined && typeof record.multiple !== "boolean") return false;
  if (record.accept !== undefined) {
    if (!Array.isArray(record.accept) || !record.accept.every((item) => typeof item === "string")) {
      return false;
    }
  }
  if (record.maxSize !== undefined && !isNonNegativeInteger(record.maxSize)) return false;
  if (record.maxFiles !== undefined && !isNonNegativeInteger(record.maxFiles)) return false;
  return true;
}

export function normalizeFileConfig(config?: FileExtensionConfig): NormalizedFileConfig {
  return {
    multiple: config?.multiple ?? false,
    accept: config?.accept ? [...config.accept] : [],
    maxSize: config?.maxSize,
    maxFiles: config?.maxFiles ?? 10,
  };
}

export function readFileConfig(node: SchemaNode): FileExtensionConfig | undefined {
  const raw = node.getCustomAttribute(FILE_ATTRIBUTE);
  return isFileExtensionConfig(raw) ? raw : undefined;
}

export function isFileDescriptor(value: unknown): value is FileDescriptor {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    typeof record.name === "string" &&
    typeof record.mimeType === "string" &&
    typeof record.size === "number" &&
    Number.isFinite(record.size) &&
    record.size >= 0
  );
}

export function isPreviewableMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

const EXTENSION_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

/** Guess MIME from extension when the browser reports an empty or generic type. */
export function guessMimeTypeFromFileName(fileName: string): string | undefined {
  const ext = fileName.toLowerCase().match(/(\.[a-z0-9]+)$/)?.[1];
  return ext ? EXTENSION_MIME[ext] : undefined;
}

export function resolveUploadMimeType(fileName: string, reportedType?: string): string {
  if (reportedType && reportedType !== "application/octet-stream") {
    return reportedType;
  }
  return guessMimeTypeFromFileName(fileName) ?? reportedType ?? "application/octet-stream";
}

function mimeTypesForAcceptCheck(
  file: Pick<FileDescriptor, "name" | "mimeType">,
): string[] {
  const types = [file.mimeType.toLowerCase()];
  const guessed = guessMimeTypeFromFileName(file.name);
  if (guessed) types.push(guessed.toLowerCase());
  return types;
}

export function matchesFileAccept(file: Pick<FileDescriptor, "name" | "mimeType">, accept: string[]): boolean {
  if (accept.length === 0) return true;
  const lowerName = file.name.toLowerCase();
  const mimeTypes = mimeTypesForAcceptCheck(file);
  return accept.some((pattern) => {
    const normalized = pattern.trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.startsWith(".")) {
      return lowerName.endsWith(normalized);
    }
    if (normalized.endsWith("/*")) {
      const prefix = normalized.slice(0, -1);
      return mimeTypes.some((mimeType) => mimeType.startsWith(prefix));
    }
    return mimeTypes.includes(normalized);
  });
}

export function validateFileDescriptor(value: unknown): boolean {
  return isFileDescriptor(value);
}

export function validateFileFieldValue(value: unknown, config?: FileExtensionConfig): boolean {
  const normalized = normalizeFileConfig(config);
  if (normalized.multiple) {
    if (!Array.isArray(value)) return false;
    if (value.length > normalized.maxFiles) return false;
    return value.every((entry) => isFileDescriptor(entry));
  }
  if (value === null || value === undefined) return true;
  return isFileDescriptor(value);
}

function createFileDescriptorSchema(registry: JsonSchemaAttributeRegistry): ObjectSchema {
  const schema = new ObjectSchema(registry);
  schema.title = "File reference";
  schema.setProperty("id", new StringSchema(registry), true);
  schema.setProperty("name", new StringSchema(registry), true);
  schema.setProperty("mimeType", new StringSchema(registry), true);
  const size = new IntegerSchema(registry);
  size.minimum = 0;
  schema.setProperty("size", size, true);
  return schema;
}

export function createSingleFileSchema(
  config: FileExtensionConfig = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): ObjectSchema {
  const schema = createFileDescriptorSchema(registry);
  schema.title = "File";
  schema.description = "Upload a single file; bytes are stored via FileFieldProvider.";
  schema.setCustomAttribute(FILE_ATTRIBUTE, normalizeFileConfig({ ...config, multiple: false }));
  return schema;
}

export function createMultipleFileSchema(
  config: FileExtensionConfig = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): ArraySchema {
  const schema = new ArraySchema(registry);
  schema.title = "Files";
  schema.description = "Upload one or more files; bytes are stored via FileFieldProvider.";
  schema.setItems(createFileDescriptorSchema(registry));
  schema.setCustomAttribute(
    FILE_ATTRIBUTE,
    normalizeFileConfig({ ...config, multiple: true }),
  );
  return schema;
}
