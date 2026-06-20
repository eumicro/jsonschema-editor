import { useEffect, useState } from "react";
import {
  isComputedExtensionConfig,
  type ComputedExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, type AttributeControlProps } from "@jsonschema-editor/react";

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
}: AttributeControlProps) {
  const [draft, setDraft] = useState(() => readConfig(modelValue));

  useEffect(() => {
    setDraft(readConfig(modelValue));
  }, [modelValue]);

  const canCommit = draft.expression.trim().length > 0;

  function commit(): void {
    if (!canCommit) return;
    onModelValueChange?.({ expression: draft.expression.trim() });
  }

  return (
    <div className="jse-computed-attr">
      <label className="jse-computed-attr__label">{label}</label>
      <JseInput
        className="jse-computed-attr__input"
        modelValue={draft.expression}
        disabled={readonly}
        placeholder="data.positionen.map(p, double(p.betrag)).sum()"
        onModelValueChange={(expression) => setDraft({ expression })}
        onBlur={commit}
      />
      <p className="jse-computed-attr__hint">
        CEL-Ausdruck mit Root-Binding <code>data</code> (gesamte Formulardaten).
      </p>
    </div>
  );
}
