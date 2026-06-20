import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { FileDescriptor } from "@jsonschema-editor/json-schema-extensions";
import { isPreviewableMimeType } from "@jsonschema-editor/json-schema-extensions";

export interface FileGalleryDialogProps {
  open: boolean;
  files: FileDescriptor[];
  thumbnails: Record<string, string | undefined>;
  startIndex?: number;
  readonly?: boolean;
  onClose: () => void;
  onDelete: (file: FileDescriptor) => void;
}

export function FileGalleryDialog({
  open,
  files,
  thumbnails,
  startIndex = 0,
  readonly,
  onClose,
  onDelete,
}: FileGalleryDialogProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const previewableFiles = useMemo(
    () => files.filter((file) => isPreviewableMimeType(file.mimeType)),
    [files],
  );

  const activeFile = previewableFiles[activeIndex];

  useEffect(() => {
    if (!open) return;
    setActiveIndex(
      Math.min(Math.max(startIndex, 0), Math.max(previewableFiles.length - 1, 0)),
    );
  }, [open, previewableFiles.length, startIndex]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleKeydown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        setActiveIndex(
          (current) => (current - 1 + previewableFiles.length) % previewableFiles.length,
        );
      } else if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current + 1) % previewableFiles.length);
      }
    },
    [onClose, previewableFiles.length],
  );

  const deleteActive = useCallback(() => {
    const file = previewableFiles[activeIndex];
    if (!file || readonly) return;
    onDelete(file);
    if (previewableFiles.length <= 1) {
      onClose();
      return;
    }
    setActiveIndex((current) => Math.min(current, previewableFiles.length - 2));
  }, [activeIndex, onClose, onDelete, previewableFiles, readonly]);

  if (!open || previewableFiles.length === 0) {
    return null;
  }

  return createPortal(
    <div
      className="jse-file-gallery"
      role="dialog"
      aria-modal="true"
      aria-label="File preview gallery"
      tabIndex={-1}
      onClick={handleBackdropClick}
      onKeyDown={handleKeydown}
    >
      <div className="jse-file-gallery__panel">
        <header className="jse-file-gallery__header">
          <strong className="jse-file-gallery__title">{activeFile?.name}</strong>
          <span className="jse-file-gallery__counter">
            {activeIndex + 1} / {previewableFiles.length}
          </span>
          <div className="jse-file-gallery__actions">
            {!readonly ? (
              <button
                type="button"
                className="jse-file-gallery__icon-btn jse-file-gallery__icon-btn--danger"
                title="Delete"
                aria-label="Delete file"
                onClick={deleteActive}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z"
                  />
                </svg>
              </button>
            ) : null}
            <button
              type="button"
              className="jse-file-gallery__icon-btn"
              title="Close"
              aria-label="Close gallery"
              onClick={onClose}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M6.4 4 4 6.4 10.6 13 4 19.6 6.4 22 13 15.4 19.6 22 22 19.6 15.4 13 22 6.4 19.6 4 13 10.6Z"
                />
              </svg>
            </button>
          </div>
        </header>

        <div className="jse-file-gallery__stage">
          {previewableFiles.length > 1 ? (
            <button
              type="button"
              className="jse-file-gallery__nav"
              aria-label="Previous image"
              onClick={() =>
                setActiveIndex(
                  (current) => (current - 1 + previewableFiles.length) % previewableFiles.length,
                )
              }
            >
              ‹
            </button>
          ) : null}

          {activeFile && thumbnails[activeFile.id] ? (
            <img
              src={thumbnails[activeFile.id]}
              alt={activeFile.name}
              className="jse-file-gallery__image"
            />
          ) : null}

          {previewableFiles.length > 1 ? (
            <button
              type="button"
              className="jse-file-gallery__nav"
              aria-label="Next image"
              onClick={() =>
                setActiveIndex((current) => (current + 1) % previewableFiles.length)
              }
            >
              ›
            </button>
          ) : null}
        </div>

        {previewableFiles.length > 1 ? (
          <div className="jse-file-gallery__thumbs">
            {previewableFiles.map((file, index) => (
              <button
                key={file.id}
                type="button"
                className={`jse-file-gallery__thumb${index === activeIndex ? " jse-file-gallery__thumb--active" : ""}`}
                aria-label={file.name}
                onClick={() => setActiveIndex(index)}
              >
                {thumbnails[file.id] ? (
                  <img src={thumbnails[file.id]} alt={file.name} />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
