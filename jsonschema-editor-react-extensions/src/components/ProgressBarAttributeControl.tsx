import { useEffect, useState } from "react";
import {
  DEFAULT_PROGRESS_BAR_COLOR,
  DEFAULT_PROGRESS_BAR_COLOR_HIGH,
  DEFAULT_PROGRESS_BAR_COLOR_LOW,
  DEFAULT_PROGRESS_BAR_COLOR_MID,
  isCssHexColor,
  isProgressBarExtensionConfig,
  type ProgressBarColorMode,
  type ProgressBarExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, useJseI18n, type AttributeControlProps } from "@jsonschema-editor/react";

interface DraftConfig {
  step: number;
  colorMode: ProgressBarColorMode;
  color: string;
  colorLow: string;
  colorMid: string;
  colorHigh: string;
}

function readDraft(value: unknown): DraftConfig {
  const base: ProgressBarExtensionConfig =
    value === true
      ? {}
      : isProgressBarExtensionConfig(value) && value !== true
        ? value
        : {};
  return {
    step: base.step && base.step > 0 ? base.step : 0.1,
    colorMode: base.colorMode === "solid" ? "solid" : "gradient",
    color: isCssHexColor(base.color) ? base.color : DEFAULT_PROGRESS_BAR_COLOR,
    colorLow: isCssHexColor(base.colorLow) ? base.colorLow : DEFAULT_PROGRESS_BAR_COLOR_LOW,
    colorMid: isCssHexColor(base.colorMid) ? base.colorMid : DEFAULT_PROGRESS_BAR_COLOR_MID,
    colorHigh: isCssHexColor(base.colorHigh) ? base.colorHigh : DEFAULT_PROGRESS_BAR_COLOR_HIGH,
  };
}

function toStored(draft: DraftConfig): ProgressBarExtensionConfig {
  if (draft.colorMode === "solid") {
    return {
      step: draft.step,
      colorMode: "solid",
      color: draft.color,
    };
  }
  return {
    step: draft.step,
    colorMode: "gradient",
    colorLow: draft.colorLow,
    colorMid: draft.colorMid,
    colorHigh: draft.colorHigh,
  };
}

export function ProgressBarAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  const { t } = useJseI18n();
  const [draft, setDraft] = useState(() => readDraft(modelValue));
  const enabled = modelValue === true || isProgressBarExtensionConfig(modelValue);

  useEffect(() => {
    setDraft(readDraft(modelValue));
  }, [modelValue]);

  function setEnabled(next: boolean): void {
    if (!next) {
      onModelValueChange?.(undefined);
      return;
    }
    onModelValueChange?.(toStored(draft));
  }

  function commit(next: DraftConfig): void {
    setDraft(next);
    if (!enabled) return;
    onModelValueChange?.(toStored(next));
  }

  function patch(partial: Partial<DraftConfig>): void {
    commit({ ...draft, ...partial });
  }

  function onColor(key: "color" | "colorLow" | "colorMid" | "colorHigh", raw: string): void {
    if (!isCssHexColor(raw)) return;
    patch({ [key]: raw.toLowerCase() });
  }

  return (
    <div className="jse-progress-bar-attr">
      <label className="jse-progress-bar-attr__label">{label}</label>

      <label className="jse-progress-bar-attr__enable">
        <input
          type="checkbox"
          checked={enabled}
          disabled={readonly}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        <span>{t("schemaAttributes.extensionEnabled")}</span>
      </label>

      <label className="jse-progress-bar-attr__field">
        <span className="jse-progress-bar-attr__field-label">step</span>
        <JseInput
          className="jse-progress-bar-attr__input"
          type="number"
          modelValue={draft.step}
          disabled={readonly || !enabled}
          min={0.01}
          step={0.1}
          onModelValueChange={(raw) => {
            const parsed = Number(raw);
            patch({ step: Number.isFinite(parsed) && parsed > 0 ? parsed : 0.1 });
          }}
        />
      </label>

      <label className="jse-progress-bar-attr__field">
        <span className="jse-progress-bar-attr__field-label">colorMode</span>
        <select
          className="jse-progress-bar-attr__select"
          value={draft.colorMode}
          disabled={readonly || !enabled}
          onChange={(event) =>
            patch({ colorMode: event.target.value as ProgressBarColorMode })
          }
        >
          <option value="gradient">gradient</option>
          <option value="solid">solid</option>
        </select>
      </label>

      {draft.colorMode === "solid" ? (
        <label className="jse-progress-bar-attr__color">
          <span className="jse-progress-bar-attr__field-label">color</span>
          <div className="jse-progress-bar-attr__color-row">
            <input
              type="color"
              className="jse-progress-bar-attr__swatch"
              value={draft.color}
              disabled={readonly || !enabled}
              onChange={(event) => onColor("color", event.target.value)}
            />
            <JseInput
              className="jse-progress-bar-attr__input"
              modelValue={draft.color}
              disabled={readonly || !enabled}
              onModelValueChange={(raw) => onColor("color", raw)}
            />
          </div>
        </label>
      ) : (
        <>
          {(
            [
              ["colorLow", draft.colorLow],
              ["colorMid", draft.colorMid],
              ["colorHigh", draft.colorHigh],
            ] as const
          ).map(([key, value]) => (
            <label key={key} className="jse-progress-bar-attr__color">
              <span className="jse-progress-bar-attr__field-label">{key}</span>
              <div className="jse-progress-bar-attr__color-row">
                <input
                  type="color"
                  className="jse-progress-bar-attr__swatch"
                  value={value}
                  disabled={readonly || !enabled}
                  onChange={(event) => onColor(key, event.target.value)}
                />
                <JseInput
                  className="jse-progress-bar-attr__input"
                  modelValue={value}
                  disabled={readonly || !enabled}
                  onModelValueChange={(raw) => onColor(key, raw)}
                />
              </div>
            </label>
          ))}
        </>
      )}

      <p className="jse-progress-bar-attr__hint">{t("schemaAttributes.x-progress-bar.hint")}</p>
    </div>
  );
}
