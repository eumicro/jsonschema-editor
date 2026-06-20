import type { InputHTMLAttributes } from "react";

export interface JseCheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "checked" | "onChange"
> {
  modelValue?: boolean;
  onModelValueChange?: (value: boolean) => void;
}

export function JseCheckbox({
  modelValue,
  onModelValueChange,
  className,
  ...rest
}: JseCheckboxProps) {
  return (
    <input
      {...rest}
      className={["jse-checkbox", className ?? ""].filter(Boolean).join(" ")}
      type="checkbox"
      checked={modelValue ?? false}
      onChange={(event) => onModelValueChange?.(event.target.checked)}
    />
  );
}
