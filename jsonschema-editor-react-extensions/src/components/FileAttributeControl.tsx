import { useEffect, useMemo, useState } from "react";
import {
  isFileExtensionConfig,
  normalizeFileConfig,
  type FileExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, type AttributeControlProps } from "@jsonschema-editor/react";

function readConfig(value: unknown): FileExtensionConfig {
  return isFileExtensionConfig(value) ? value : {};
}

export function FileAttributeControl({
  label: _label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  const [draft, setDraft] = useState<FileExtensionConfig>(() => readConfig(modelValue));

  useEffect(() => {
    setDraft(readConfig(modelValue));
  }, [modelValue]);

  const acceptText = useMemo(() => (draft.accept ?? []).join(", "), [draft.accept]);

  function commit(next: FileExtensionConfig): void {
    onModelValueChange?.(normalizeFileConfig(next));
  }

  function setMultiple(multiple: boolean): void {
    const next = { ...draft, multiple };
    setDraft(next);
    commit(next);
  }

  return (
    <div className="jse-file-attr">
      <label className="jse-file-attr__row">
        <input
          type="checkbox"
          checked={draft.multiple ?? false}
          disabled={readonly}
          onChange={(event) => setMultiple(event.target.checked)}
        />
        <span>Multiple files</span>
      </label>

      <label className="jse-file-attr__field">
        <span className="jse-file-attr__label">Accepted types</span>
        <JseInput
          modelValue={acceptText}
          readOnly={readonly}
          placeholder="image/*, application/pdf"
          onModelValueChange={(text) => {
            const next = {
              ...draft,
              accept: text
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean),
            };
            setDraft(next);
            commit(next);
          }}
        />
      </label>

      <label className="jse-file-attr__field">
        <span className="jse-file-attr__label">Max size (bytes)</span>
        <JseInput
          modelValue={draft.maxSize?.toString() ?? ""}
          readOnly={readonly}
          inputMode="numeric"
          placeholder="optional"
          onModelValueChange={(text) => {
            const next = { ...draft, maxSize: text ? Number(text) : undefined };
            setDraft(next);
            commit(next);
          }}
        />
      </label>

      {draft.multiple ? (
        <label className="jse-file-attr__field">
          <span className="jse-file-attr__label">Max files</span>
          <JseInput
            modelValue={(draft.maxFiles ?? 10).toString()}
            readOnly={readonly}
            inputMode="numeric"
            onModelValueChange={(text) => {
              const next = { ...draft, maxFiles: text ? Number(text) : 10 };
              setDraft(next);
              commit(next);
            }}
          />
        </label>
      ) : null}
    </div>
  );
}
