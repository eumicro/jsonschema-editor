import { useEffect, useState } from "react";
import {
  DEFAULT_RATING_COLOR,
  DEFAULT_RATING_COLOR_HIGH,
  DEFAULT_RATING_COLOR_LOW,
  DEFAULT_RATING_COLOR_MID,
  DEFAULT_RATING_SYMBOL,
  isCssHexColor,
  isRatingExtensionConfig,
  isRatingSymbolGlyph,
  resolveRatingSymbolGlyph,
  RATING_SYMBOL_PALETTE,
  type RatingColorMode,
  type RatingExtensionConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { JseInput, useJseI18n, type AttributeControlProps } from "@jsonschema-editor/react";

interface DraftConfig {
  symbol: string;
  step: number;
  colorMode: RatingColorMode;
  color: string;
  colorLow: string;
  colorMid: string;
  colorHigh: string;
}

function readDraft(value: unknown): DraftConfig {
  const base: RatingExtensionConfig =
    value === true
      ? {}
      : isRatingExtensionConfig(value) && value !== true
        ? value
        : {};
  return {
    symbol: resolveRatingSymbolGlyph(base.symbol, base.character),
    step: base.step && base.step > 0 ? base.step : 1,
    colorMode: base.colorMode === "solid" ? "solid" : "gradient",
    color: isCssHexColor(base.color) ? base.color : DEFAULT_RATING_COLOR,
    colorLow: isCssHexColor(base.colorLow) ? base.colorLow : DEFAULT_RATING_COLOR_LOW,
    colorMid: isCssHexColor(base.colorMid) ? base.colorMid : DEFAULT_RATING_COLOR_MID,
    colorHigh: isCssHexColor(base.colorHigh) ? base.colorHigh : DEFAULT_RATING_COLOR_HIGH,
  };
}

function toStored(draft: DraftConfig): RatingExtensionConfig {
  const stored: RatingExtensionConfig = {
    symbol: draft.symbol || DEFAULT_RATING_SYMBOL,
    step: draft.step,
    colorMode: draft.colorMode,
  };
  if (draft.colorMode === "solid") {
    stored.color = draft.color;
  } else {
    stored.colorLow = draft.colorLow;
    stored.colorMid = draft.colorMid;
    stored.colorHigh = draft.colorHigh;
  }
  return stored;
}

export function RatingAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  const { t } = useJseI18n();
  const [draft, setDraft] = useState(() => readDraft(modelValue));
  const enabled = modelValue === true || isRatingExtensionConfig(modelValue);

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

  function onCustomSymbol(raw: unknown): void {
    const text = String(raw ?? "").trim();
    if (!text) {
      patch({ symbol: DEFAULT_RATING_SYMBOL });
      return;
    }
    if (!isRatingSymbolGlyph(text)) return;
    patch({ symbol: resolveRatingSymbolGlyph(text) });
  }

  return (
    <div className="jse-rating-attr">
      <label className="jse-rating-attr__label">{label}</label>

      <label className="jse-rating-attr__enable">
        <input
          type="checkbox"
          checked={enabled}
          disabled={readonly}
          onChange={(event) => setEnabled(event.target.checked)}
        />
        <span>{t("schemaAttributes.extensionEnabled")}</span>
      </label>

      <div className="jse-rating-attr__field">
        <span className="jse-rating-attr__field-label">
          {t("schemaAttributes.x-rating.symbolPalette")}
        </span>
        <div
          className="jse-rating-attr__palette"
          role="listbox"
          aria-label={t("schemaAttributes.x-rating.symbolPalette")}
        >
          {RATING_SYMBOL_PALETTE.map((glyph) => (
            <button
              key={glyph}
              type="button"
              className={`jse-rating-attr__symbol-option${
                draft.symbol === glyph ? " jse-rating-attr__symbol-option--active" : ""
              }`}
              role="option"
              aria-selected={draft.symbol === glyph}
              title={glyph}
              disabled={readonly || !enabled}
              onClick={() => patch({ symbol: glyph })}
            >
              {glyph}
            </button>
          ))}
        </div>
      </div>

      <label className="jse-rating-attr__field">
        <span className="jse-rating-attr__field-label">
          {t("schemaAttributes.x-rating.customSymbol")}
        </span>
        <div className="jse-rating-attr__selected-row">
          <span className="jse-rating-attr__selected-preview" aria-hidden="true">
            {draft.symbol}
          </span>
          <JseInput
            className="jse-rating-attr__input"
            type="text"
            modelValue={draft.symbol}
            disabled={readonly || !enabled}
            placeholder={t("schemaAttributes.x-rating.customSymbolPlaceholder")}
            onModelValueChange={onCustomSymbol}
          />
        </div>
      </label>

      <label className="jse-rating-attr__field">
        <span className="jse-rating-attr__field-label">step</span>
        <JseInput
          className="jse-rating-attr__input"
          type="number"
          modelValue={draft.step}
          disabled={readonly || !enabled}
          min={0.1}
          step={0.5}
          onModelValueChange={(raw) => {
            const parsed = Number(raw);
            patch({ step: Number.isFinite(parsed) && parsed > 0 ? parsed : 1 });
          }}
        />
      </label>

      <label className="jse-rating-attr__field">
        <span className="jse-rating-attr__field-label">colorMode</span>
        <select
          className="jse-rating-attr__select"
          value={draft.colorMode}
          disabled={readonly || !enabled}
          onChange={(event) =>
            patch({ colorMode: event.target.value as RatingColorMode })
          }
        >
          <option value="gradient">gradient</option>
          <option value="solid">solid</option>
        </select>
      </label>

      {draft.colorMode === "solid" ? (
        <label className="jse-rating-attr__color">
          <span className="jse-rating-attr__field-label">color</span>
          <div className="jse-rating-attr__color-row">
            <input
              className="jse-rating-attr__swatch"
              type="color"
              value={draft.color}
              disabled={readonly || !enabled}
              onChange={(event) => onColor("color", event.target.value)}
            />
            <JseInput
              className="jse-rating-attr__input"
              type="text"
              modelValue={draft.color}
              disabled={readonly || !enabled}
              onModelValueChange={(raw) => onColor("color", String(raw ?? ""))}
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
          ).map(([key, colorValue]) => (
            <label key={key} className="jse-rating-attr__color">
              <span className="jse-rating-attr__field-label">{key}</span>
              <div className="jse-rating-attr__color-row">
                <input
                  className="jse-rating-attr__swatch"
                  type="color"
                  value={colorValue}
                  disabled={readonly || !enabled}
                  onChange={(event) => onColor(key, event.target.value)}
                />
                <JseInput
                  className="jse-rating-attr__input"
                  type="text"
                  modelValue={colorValue}
                  disabled={readonly || !enabled}
                  onModelValueChange={(raw) => onColor(key, String(raw ?? ""))}
                />
              </div>
            </label>
          ))}
        </>
      )}

      <p className="jse-rating-attr__hint">{t("schemaAttributes.x-rating.hint")}</p>
    </div>
  );
}
