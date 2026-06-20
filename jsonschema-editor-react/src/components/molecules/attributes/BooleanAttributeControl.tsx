import { JseCheckbox } from "../../atoms/JseCheckbox.js";
import { JseFormField } from "../JseFormField.js";
import type { AttributeControlProps } from "../../../types/attribute-control-props.js";

export function BooleanAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  return (
    <JseFormField label={label} boolean>
      <JseCheckbox
        modelValue={modelValue === true}
        disabled={readonly}
        onModelValueChange={(value) => onModelValueChange?.(value)}
      />
    </JseFormField>
  );
}
