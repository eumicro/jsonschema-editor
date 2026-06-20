import { useJseI18n } from "../../../context/JseI18nContext.js";
import {
  FIELD_HIDDEN_ATTRIBUTE,
  FIELD_READ_ONLY_ATTRIBUTE,
} from "../../../utils/field-behavior.js";

export interface SchemaFieldBulkActionsProps {
  onApply: (attributeName: string, value: boolean) => void;
}

export function SchemaFieldBulkActions({ onApply }: SchemaFieldBulkActionsProps) {
  const { t } = useJseI18n();

  return (
    <fieldset className="jse-field-bulk-actions">
      <legend>{t("schemaAttributes.bulkFieldExtensions")}</legend>
      <p className="jse-field-bulk-actions__hint">
        {t("schemaAttributes.bulkFieldExtensionsHint")}
      </p>
      <div className="jse-field-bulk-actions__buttons">
        <button
          type="button"
          className="jse-field-bulk-actions__btn"
          onClick={() => onApply(FIELD_READ_ONLY_ATTRIBUTE, true)}
        >
          {t("schemaAttributes.bulkSetReadOnly")}
        </button>
        <button
          type="button"
          className="jse-field-bulk-actions__btn"
          onClick={() => onApply(FIELD_READ_ONLY_ATTRIBUTE, false)}
        >
          {t("schemaAttributes.bulkClearReadOnly")}
        </button>
        <button
          type="button"
          className="jse-field-bulk-actions__btn"
          onClick={() => onApply(FIELD_HIDDEN_ATTRIBUTE, true)}
        >
          {t("schemaAttributes.bulkSetHidden")}
        </button>
        <button
          type="button"
          className="jse-field-bulk-actions__btn"
          onClick={() => onApply(FIELD_HIDDEN_ATTRIBUTE, false)}
        >
          {t("schemaAttributes.bulkClearHidden")}
        </button>
      </div>
    </fieldset>
  );
}
