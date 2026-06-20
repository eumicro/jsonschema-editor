import type { InputHTMLAttributes } from "react";

export interface JseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  modelValue?: string | number;
  onModelValueChange?: (value: string) => void;
}

export function JseInput({
  modelValue,
  onModelValueChange,
  className,
  ...rest
}: JseInputProps) {
  return (
    <input
      {...rest}
      className={className}
      value={modelValue ?? ""}
      onChange={(event) => onModelValueChange?.(event.target.value)}
    />
  );
}
