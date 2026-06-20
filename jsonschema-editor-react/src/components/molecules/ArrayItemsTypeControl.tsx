import { JseButton } from "../atoms/JseButton.js";
import { useJseI18n } from "../../context/JseI18nContext.js";
import {
  COMPOSITE_SCHEMA_KINDS,
  listExtensionTypeOptions,
  PRIMITIVE_SCHEMA_KINDS,
  STRING_FORMAT_SCHEMA_KINDS,
} from "../../utils/schema-editor-types.js";

export interface ArrayItemsTypeControlProps {
  currentKind?: string;
  compact?: boolean;
  onSelect: (kind: string) => void;
}

export function ArrayItemsTypeControl({
  currentKind,
  compact,
  onSelect,
}: ArrayItemsTypeControlProps) {
  const { t } = useJseI18n();
  const extensionTypeOptions = listExtensionTypeOptions();

  return (
    <div className="jse-array-items-type">
      {currentKind ? (
        <p className="jse-array-items-type__current">
          {t("arrayItems.current", { kind: currentKind })}
        </p>
      ) : (
        <p className="jse-array-items-type__current jse-array-items-type__current--empty">
          {t("arrayItems.none")}
        </p>
      )}

      <div className="jse-array-items-type__group">
        <span className="jse-structure-editor__hint">{t("arrayItems.primitive")}</span>
        <div className="jse-structure-editor__buttons">
          {PRIMITIVE_SCHEMA_KINDS.map((kind) => (
            <JseButton
              key={kind}
              type="button"
              className={currentKind === kind ? "jse-btn--active" : ""}
              onClick={() => onSelect(kind)}
            >
              {kind}
            </JseButton>
          ))}
          {extensionTypeOptions.map((option) => (
            <JseButton
              key={option.id}
              type="button"
              className={currentKind === option.id ? "jse-btn--active" : ""}
              onClick={() => onSelect(option.id)}
            >
              {option.label}
            </JseButton>
          ))}
        </div>
      </div>

      <div className="jse-array-items-type__group">
        <span className="jse-structure-editor__hint">{t("arrayItems.stringFormat")}</span>
        <div className="jse-structure-editor__buttons">
          {STRING_FORMAT_SCHEMA_KINDS.map((kind) => (
            <JseButton
              key={kind}
              type="button"
              className={currentKind === kind ? "jse-btn--active" : ""}
              onClick={() => onSelect(kind)}
            >
              {kind}
            </JseButton>
          ))}
        </div>
      </div>

      <div className="jse-array-items-type__group">
        <span className="jse-structure-editor__hint">{t("arrayItems.structure")}</span>
        <div className="jse-structure-editor__buttons">
          {COMPOSITE_SCHEMA_KINDS.map((kind) => (
            <JseButton
              key={kind}
              type="button"
              className={currentKind === kind ? "jse-btn--active" : ""}
              onClick={() => onSelect(kind)}
            >
              {kind}
            </JseButton>
          ))}
        </div>
      </div>

      {!compact ? (
        <p className="jse-structure-editor__note">{t("arrayItems.note")}</p>
      ) : null}
    </div>
  );
}
