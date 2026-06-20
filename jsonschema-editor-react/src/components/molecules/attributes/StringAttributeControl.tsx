import { JseInput } from "../../atoms/JseInput.js";
import { JseFormField } from "../JseFormField.js";
import type { AttributeControlProps } from "../../../types/attribute-control-props.js";

export function StringAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  return (
    <JseFormField label={label}>
      <JseInput
        modelValue={typeof modelValue === "string" ? modelValue : String(modelValue ?? "")}
        disabled={readonly}
        onModelValueChange={(value) => onModelValueChange?.(value)}
      />
    </JseFormField>
  );
}
