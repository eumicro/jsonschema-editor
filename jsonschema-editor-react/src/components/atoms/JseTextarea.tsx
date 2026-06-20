import type { TextareaHTMLAttributes } from "react";

export interface JseTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> {
  modelValue?: string;
  onModelValueChange?: (value: string) => void;
}

export function JseTextarea({
  modelValue,
  onModelValueChange,
  className,
  rows = 3,
  ...rest
}: JseTextareaProps) {
  return (
    <textarea
      {...rest}
      className={["jse-textarea", className ?? ""].filter(Boolean).join(" ")}
      value={modelValue ?? ""}
      rows={rows}
      spellCheck={false}
      onChange={(event) => onModelValueChange?.(event.target.value)}
    />
  );
}
