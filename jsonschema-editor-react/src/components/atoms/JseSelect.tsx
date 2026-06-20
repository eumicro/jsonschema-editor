import type { ReactNode, SelectHTMLAttributes } from "react";

export interface JseSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> {
  modelValue?: string | number;
  onModelValueChange?: (value: string | number) => void;
  children: ReactNode;
}

function parseSelectValue(raw: string): string | number {
  if (raw !== "" && !Number.isNaN(Number(raw)) && /^\d+$/.test(raw)) {
    return Number(raw);
  }
  return raw;
}

export function JseSelect({
  modelValue,
  onModelValueChange,
  className,
  children,
  ...rest
}: JseSelectProps) {
  return (
    <select
      {...rest}
      className={["jse-select", className ?? ""].filter(Boolean).join(" ")}
      value={modelValue}
      onChange={(event) => onModelValueChange?.(parseSelectValue(event.target.value))}
    >
      {children}
    </select>
  );
}
