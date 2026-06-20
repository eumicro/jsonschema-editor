import type {
  FileDescriptor,
  FileFieldContext,
  FileFieldProvider,
} from "@jsonschema-editor/json-schema-extensions";
import { isPreviewableMimeType } from "@jsonschema-editor/json-schema-extensions";

interface StoredFile {
  blob: Blob;
  descriptor: FileDescriptor;
}

function createFileId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Demo/test provider that keeps blobs in memory.
 * Replace with an app-specific implementation (S3, API, IndexedDB, …).
 */
export function createInMemoryFileFieldProvider(): InMemoryFileFieldProvider {
  const store = new Map<string, StoredFile>();
  const thumbnailCache = new Map<string, string>();

  const provider: InMemoryFileFieldProvider = {
    async store(file, meta, _context) {
      const descriptor: FileDescriptor = {
        id: createFileId(),
        name: meta.name,
        mimeType: meta.mimeType,
        size: meta.size,
      };
      store.set(descriptor.id, { blob: file, descriptor });
      return descriptor;
    },

    async load(descriptor, _context) {
      const entry = store.get(descriptor.id);
      if (!entry) {
        throw new Error(`File not found: ${descriptor.id}`);
      }
      return entry.blob;
    },

    async delete(descriptor, _context) {
      store.delete(descriptor.id);
      const cached = thumbnailCache.get(descriptor.id);
      if (cached?.startsWith("blob:")) {
        URL.revokeObjectURL(cached);
      }
      thumbnailCache.delete(descriptor.id);
    },

    async renderThumbnail(descriptor, context) {
      if (!isPreviewableMimeType(descriptor.mimeType)) {
        return undefined;
      }
      const cached = thumbnailCache.get(descriptor.id);
      if (cached) return cached;

      const blob = await this.load(descriptor, context as FileFieldContext);
      const url = URL.createObjectURL(blob);
      thumbnailCache.set(descriptor.id, url);
      return url;
    },

    seed(descriptor, blob) {
      store.set(descriptor.id, { blob, descriptor });
      const cached = thumbnailCache.get(descriptor.id);
      if (cached?.startsWith("blob:")) {
        URL.revokeObjectURL(cached);
      }
      thumbnailCache.delete(descriptor.id);
    },
  };

  return provider;
}

export interface InMemoryFileFieldProvider extends FileFieldProvider {
  /** Preload demo or persisted files referenced by form JSON descriptors. */
  seed(descriptor: FileDescriptor, blob: Blob): void;
}
