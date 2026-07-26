import { useEffect, useState } from "react";
import {
  isComputedExtensionConfig,
  type ComputedExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { useJseI18n, type AttributeControlProps } from "@jsonschema-editor/react";
import { CelExpressionEditor } from "./CelExpressionEditor.js";
import "../computed-attribute.css";

function readConfig(value: unknown): ComputedExtensionConfig {
  if (isComputedExtensionConfig(value)) {
    return { expression: value.expression };
  }
  return { expression: "" };
}

export function ComputedAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
  document,
}: AttributeControlProps) {
  const { t } = useJseI18n();
  const [draft, setDraft] = useState(() => readConfig(modelValue));
  const enabled = modelValue !== undefined && modelValue !== null;

  useEffect(() => {
    setDraft(readConfig(modelValue));
  }, [modelValue]);

  const canCommit = draft.expression.trim().length > 0;

  function setEnabled(next: boolean): void {
    if (!next) {
      onModelValueChange?.(undefined);
      return;
    }
    onModelValueChange?.(
      canCommit ? { expression: draft.expression.trim() } : { expression: "" },
    );
  }

  function commit(): void {
    if (!enabled) return;
    if (!canCommit) {
      onModelValueChange?.({ expression: "" });
      return;
    }
    onModelValueChange?.({ expression: draft.expression.trim() });
  }

  return (
    <div className="jse-computed-attr">
      <label className="jse-computed-attr__label">{label}</label>
      <label className="jse-computed-attr__enable">
        <input
          type="checkbox"
          checked={enabled}
          disabled={readonly}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        <span>{t("schemaAttributes.extensionEnabled")}</span>
      </label>
      <CelExpressionEditor
        value={draft.expression}
        disabled={readonly || !enabled}
        document={document}
        placeholder="data.positionen.map(p, double(p.betrag)).sum()"
        onChange={(expression) => setDraft({ expression })}
        onBlur={commit}
      />
      <p className="jse-computed-attr__hint">{t("schemaAttributes.x-computed.hint")}</p>
    </div>
  );
}
