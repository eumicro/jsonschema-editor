import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArraySchema } from "@jsonschema-editor/json-schema";
import {
  isFileDescriptor,
  isPreviewableMimeType,
  matchesFileAccept,
  normalizeFileConfig,
  readFileConfig,
  resolveUploadMimeType,
  type FileDescriptor,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseSchemaFormField,
  useArrayFieldValue,
  useFormFieldLabel,
  useScopedField,
  type FormFieldProps,
} from "@jsonschema-editor/react";
import { FileGalleryDialog } from "./FileGalleryDialog.js";
import { useFileFieldProvider } from "../file-field-provider.js";

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileFieldFormField({
  schema,
  document,
  scope,
  label,
  i18nKey,
  readonly,
}: FormFieldProps) {
  const { fieldSchema, value, setValue } = useScopedField(schema, scope, document);
  const { items, setItems } = useArrayFieldValue(scope);
  const { resolvedSchema, displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey,
  );

  const provider = useFileFieldProvider();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string | undefined>>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const fileConfig = useMemo(() => {
    const node = resolvedSchema;
    return node ? normalizeFileConfig(readFileConfig(node)) : undefined;
  }, [resolvedSchema]);

  const isMultiple = useMemo(() => {
    const node = resolvedSchema;
    if (!node) return false;
    if (node instanceof ArraySchema) return true;
    return fileConfig?.multiple ?? false;
  }, [fileConfig?.multiple, resolvedSchema]);

  const files = useMemo((): FileDescriptor[] => {
    if (isMultiple) {
      return items.filter(isFileDescriptor);
    }
    return isFileDescriptor(value) ? [value] : [];
  }, [isMultiple, items, value]);

  const canAddMore = useMemo(() => {
    if (readonly || !fileConfig) return false;
    if (!isMultiple) return files.length === 0;
    return files.length < fileConfig.maxFiles;
  }, [fileConfig, files.length, isMultiple, readonly]);

  const acceptAttribute = fileConfig?.accept.join(",") ?? undefined;
  const fieldContext = useMemo(() => ({ scope }), [scope]);

  useEffect(() => {
    let cancelled = false;

    async function refreshThumbnails(list: FileDescriptor[]): Promise<void> {
      const next: Record<string, string | undefined> = {};
      for (const file of list) {
        if (!isPreviewableMimeType(file.mimeType) || !provider.renderThumbnail) {
          next[file.id] = undefined;
          continue;
        }
        try {
          next[file.id] = await provider.renderThumbnail(file, fieldContext);
        } catch {
          next[file.id] = undefined;
        }
      }
      if (!cancelled) setThumbnails(next);
    }

    void refreshThumbnails(files);

    return () => {
      cancelled = true;
    };
  }, [fieldContext, files, provider]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(thumbnails)) {
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, [thumbnails]);

  const openFilePicker = useCallback(() => {
    setUploadError(null);
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(
    async (file: FileDescriptor): Promise<void> => {
      if (readonly) return;
      try {
        await provider.delete(file, fieldContext);
      } catch {
        // Still remove reference from form data when provider cleanup fails.
      }

      if (isMultiple) {
        setItems(files.filter((entry) => entry.id !== file.id));
      } else {
        setValue(null);
      }
    },
    [fieldContext, files, isMultiple, provider, readonly, setItems, setValue],
  );

  const openGallery = useCallback(
    (file: FileDescriptor): void => {
      const previewable = files.filter((entry) => isPreviewableMimeType(entry.mimeType));
      const index = previewable.findIndex((entry) => entry.id === file.id);
      if (index < 0) return;
      setGalleryStartIndex(index);
      setGalleryOpen(true);
    },
    [files],
  );

  async function onInputChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const input = event.target;
    const batch = Array.from(input.files ?? []);
    input.value = "";
    if (!batch.length || !fileConfig) return;

    setUploading(true);
    setUploadError(null);

    try {
      const remaining = isMultiple ? fileConfig.maxFiles - files.length : 1;
      const filesToUpload = batch.slice(0, Math.max(remaining, 0));
      const uploaded: typeof files = [];

      for (const file of filesToUpload) {
        if (fileConfig.maxSize !== undefined && file.size > fileConfig.maxSize) {
          setUploadError(`File too large: ${file.name}`);
          continue;
        }
        const meta = {
          name: file.name,
          mimeType: resolveUploadMimeType(file.name, file.type),
          size: file.size,
        };
        if (!matchesFileAccept(meta, fileConfig.accept)) {
          setUploadError(`File type not allowed: ${file.name}`);
          continue;
        }

        uploaded.push(await provider.store(file, meta, fieldContext));
      }

      if (uploaded.length === 0) return;

      if (isMultiple) {
        setItems([...files, ...uploaded]);
      } else {
        setValue(uploaded[0] ?? null);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <JseSchemaFormField label={displayLabel} description={description} scope={scope}>
      <div className="jse-file-field">
        <input
          ref={fileInputRef}
          className="jse-file-field__input"
          type="file"
          accept={acceptAttribute}
          multiple={isMultiple}
          disabled={readonly || !canAddMore || uploading}
          onChange={(event) => void onInputChange(event)}
        />

        {files.length > 0 ? (
          <div className="jse-file-field__list">
            {files.map((file) => (
              <article key={file.id} className="jse-file-field__item">
                <div className="jse-file-field__preview">
                  {thumbnails[file.id] ? (
                    <img
                      src={thumbnails[file.id]}
                      alt={file.name}
                      className="jse-file-field__thumb-image"
                    />
                  ) : (
                    <div className="jse-file-field__thumb-fallback" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="28" height="28">
                        <path
                          fill="currentColor"
                          d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM8 11h8v2H8v-2Zm0 4h8v2H8v-2Z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="jse-file-field__meta">
                  <span className="jse-file-field__name">{file.name}</span>
                  <span className="jse-file-field__size">{formatSize(file.size)}</span>
                </div>

                <div className="jse-file-field__actions">
                  {isPreviewableMimeType(file.mimeType) ? (
                    <button
                      type="button"
                      className="jse-file-field__icon-btn"
                      title="Preview"
                      aria-label="Preview file"
                      onClick={() => openGallery(file)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5C21.3 7.6 17 4.5 12 4.5Zm0 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                        />
                      </svg>
                    </button>
                  ) : null}
                  {!readonly ? (
                    <button
                      type="button"
                      className="jse-file-field__icon-btn jse-file-field__icon-btn--danger"
                      title="Delete"
                      aria-label="Delete file"
                      onClick={() => void removeFile(file)}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {canAddMore ? (
          <button
            type="button"
            className="jse-file-field__upload-btn"
            disabled={uploading}
            onClick={openFilePicker}
          >
            {uploading ? "Uploading…" : isMultiple ? "Add files" : "Choose file"}
          </button>
        ) : null}

        {uploadError ? (
          <p className="jse-file-field__error" role="alert">
            {uploadError}
          </p>
        ) : null}
      </div>

      <FileGalleryDialog
        open={galleryOpen}
        files={files}
        thumbnails={thumbnails}
        startIndex={galleryStartIndex}
        readonly={readonly}
        onClose={() => setGalleryOpen(false)}
        onDelete={(file) => void removeFile(file)}
      />
    </JseSchemaFormField>
  );
}
