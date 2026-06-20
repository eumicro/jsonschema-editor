import { JseInput } from "../../atoms/JseInput.js";
import { JseFormField } from "../JseFormField.js";
import type { AttributeControlProps } from "../../../types/attribute-control-props.js";

export function NumberAttributeControl({
  label,
  readonly,
  modelValue,
  onModelValueChange,
}: AttributeControlProps) {
  const numericValue =
    typeof modelValue === "number" ? modelValue : modelValue === undefined ? "" : String(modelValue);

  return (
    <JseFormField label={label}>
      <JseInput
        type="number"
        modelValue={numericValue}
        disabled={readonly}
        onModelValueChange={(value) =>
          onModelValueChange?.(value === "" ? undefined : Number(value))
        }
      />
    </JseFormField>
  );
}
