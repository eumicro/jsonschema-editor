import { JseTextarea } from "../../atoms/JseTextarea.js";
import { JseFormField } from "../JseFormField.js";
import type { AttributeControlProps } from "../../../types/attribute-control-props.js";

export function JsonAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  const textValue =
    typeof modelValue === "string"
      ? modelValue
      : modelValue === undefined
        ? ""
        : JSON.stringify(modelValue, null, 2);

  return (
    <JseFormField label={label}>
      <JseTextarea
        modelValue={textValue}
        disabled={readonly}
        rows={3}
        onModelValueChange={(value) => {
          try {
            onModelValueChange?.(JSON.parse(value));
          } catch {
            onModelValueChange?.(value);
          }
        }}
      />
    </JseFormField>
  );
}
