import { isSwitchExtensionConfig } from "@jsonschema-editor/json-schema-extensions";
import { JseCheckbox, useJseI18n, type AttributeControlProps } from "@jsonschema-editor/react";

export function SwitchAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  const { t } = useJseI18n();
  const enabled = isSwitchExtensionConfig(modelValue);

  return (
    <div className="jse-switch-attr">
      <label className="jse-switch-attr__label">{label}</label>
      <p className="jse-switch-attr__hint">{t("schemaAttributes.x-switch.hint")}</p>
      <label className="jse-switch-attr__enable">
        <JseCheckbox
          modelValue={enabled}
          disabled={readonly}
          onModelValueChange={(next) => onModelValueChange?.(next ? true : undefined)}
        />
        <span>{t("schemaAttributes.extensionEnabled")}</span>
      </label>
    </div>
  );
}
