import { useEffect, useState } from "react";
import {
  DEFAULT_GEOMETRY_STYLE_URL,
  isGeometryExtensionConfig,
  normalizeGeometryConfig,
  type GeometryExtensionConfig,
  type NormalizedGeometryConfig,
} from "@jsonschema-editor/json-schema-extensions";
import {
  JseInput,
  JseSelect,
  useJseI18n,
  type AttributeControlProps,
} from "@jsonschema-editor/react";

type CountMode = "range" | "exact";

function readConfig(value: unknown): NormalizedGeometryConfig {
  return isGeometryExtensionConfig(value)
    ? normalizeGeometryConfig(value)
    : normalizeGeometryConfig();
}

function toStoredConfig(
  draft: NormalizedGeometryConfig,
  countMode: CountMode
): GeometryExtensionConfig {
  const base: GeometryExtensionConfig = {
    styleUrl: draft.styleUrl,
    point: draft.point,
    line: draft.line,
    polygon: draft.polygon,
  };

  if (countMode === "exact") {
    return { ...base, exactObjects: draft.maxObjects };
  }

  return {
    ...base,
    minObjects: draft.minObjects,
    maxObjects: draft.maxObjects,
  };
}

export function GeometryAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  const { t } = useJseI18n();
  const [draft, setDraft] = useState<NormalizedGeometryConfig>(() =>
    readConfig(modelValue)
  );
  const [countMode, setCountMode] = useState<CountMode>(() =>
    readConfig(modelValue).exactObjects !== undefined ? "exact" : "range"
  );

  useEffect(() => {
    const next = readConfig(modelValue);
    setDraft(next);
    setCountMode(next.exactObjects !== undefined ? "exact" : "range");
  }, [modelValue]);

  const atLeastOneType = draft.point || draft.line || draft.polygon;

  function commit(
    nextDraft: NormalizedGeometryConfig,
    mode: CountMode = countMode
  ): void {
    if (!nextDraft.point && !nextDraft.line && !nextDraft.polygon) return;
    onModelValueChange?.(toStoredConfig(nextDraft, mode));
  }

  function setCountModeAndCommit(mode: CountMode): void {
    setCountMode(mode);
    let next = draft;
    if (mode === "exact") {
      next = {
        ...draft,
        minObjects: draft.maxObjects,
        exactObjects: draft.maxObjects,
      };
    } else {
      next = {
        ...draft,
        exactObjects: undefined,
        minObjects: Math.min(draft.minObjects, draft.maxObjects),
      };
    }
    setDraft(next);
    commit(next, mode);
  }

  return (
    <fieldset className="jse-geometry-attr">
      <legend>{label}</legend>

      <label className="jse-geometry-attr__row">
        <span>styleUrl</span>
        <JseInput
          className="jse-field__input"
          modelValue={draft.styleUrl}
          disabled={readonly}
          onModelValueChange={(value) => {
            const next = {
              ...draft,
              styleUrl: value || DEFAULT_GEOMETRY_STYLE_URL,
            };
            setDraft(next);
            commit(next);
          }}
        />
      </label>

      <label className="jse-geometry-attr__check">
        <input
          type="checkbox"
          checked={draft.point}
          disabled={readonly}
          onChange={(event) => {
            const next = { ...draft, point: event.target.checked };
            setDraft(next);
            commit(next);
          }}
        />
        {t("extensions.geometry.point")}
      </label>

      <label className="jse-geometry-attr__check">
        <input
          type="checkbox"
          checked={draft.line}
          disabled={readonly}
          onChange={(event) => {
            const next = { ...draft, line: event.target.checked };
            setDraft(next);
            commit(next);
          }}
        />
        {t("extensions.geometry.line")}
      </label>

      <label className="jse-geometry-attr__check">
        <input
          type="checkbox"
          checked={draft.polygon}
          disabled={readonly}
          onChange={(event) => {
            const next = { ...draft, polygon: event.target.checked };
            setDraft(next);
            commit(next);
          }}
        />
        {t("extensions.geometry.polygon")}
      </label>

      <label className="jse-geometry-attr__row">
        <span>{t("schemaAttributes.x-geometry.countMode")}</span>
        <JseSelect
          className="jse-field__input"
          modelValue={countMode}
          disabled={readonly}
          onModelValueChange={(value) =>
            setCountModeAndCommit(String(value) as CountMode)
          }
        >
          <option value="range">
            {t("schemaAttributes.x-geometry.countModeRange")}
          </option>
          <option value="exact">
            {t("schemaAttributes.x-geometry.countModeExact")}
          </option>
        </JseSelect>
      </label>

      {countMode === "range" ? (
        <>
          <label className="jse-geometry-attr__row">
            <span>minObjects</span>
            <JseInput
              className="jse-field__input"
              type="number"
              modelValue={draft.minObjects}
              disabled={readonly}
              onModelValueChange={(value) => {
                const minObjects = Math.max(0, Number(value) || 0);
                const next = {
                  ...draft,
                  minObjects: Math.min(minObjects, draft.maxObjects),
                  exactObjects: undefined,
                };
                setDraft(next);
                commit(next);
              }}
            />
          </label>
          <label className="jse-geometry-attr__row">
            <span>maxObjects</span>
            <JseInput
              className="jse-field__input"
              type="number"
              modelValue={draft.maxObjects}
              disabled={readonly}
              onModelValueChange={(value) => {
                const maxObjects = Math.max(0, Number(value) || 0);
                const next = {
                  ...draft,
                  maxObjects,
                  minObjects: Math.min(draft.minObjects, maxObjects),
                  exactObjects: undefined,
                };
                setDraft(next);
                commit(next);
              }}
            />
          </label>
        </>
      ) : (
        <label className="jse-geometry-attr__row">
          <span>exactObjects</span>
          <JseInput
            className="jse-field__input"
            type="number"
            modelValue={draft.maxObjects}
            disabled={readonly}
            onModelValueChange={(value) => {
              const exactObjects = Math.max(0, Number(value) || 0);
              const next = {
                ...draft,
                minObjects: exactObjects,
                maxObjects: exactObjects,
                exactObjects,
              };
              setDraft(next);
              commit(next);
            }}
          />
        </label>
      )}

      {!atLeastOneType ? (
        <p className="jse-field__hint jse-field__hint--error">
          {t("schemaAttributes.x-geometry.typeRequired")}
        </p>
      ) : null}
    </fieldset>
  );
}
