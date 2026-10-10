import type { ButtonHTMLAttributes } from "react";

export interface JseSwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "role" | "aria-checked" | "onClick" | "children"
> {
  modelValue?: boolean;
  onModelValueChange?: (value: boolean) => void;
  /** Accessible name when not wrapped by a visible label. */
  ariaLabel?: string;
}

export function JseSwitch({
  modelValue = false,
  onModelValueChange,
  disabled,
  className,
  ariaLabel,
  id,
  ...rest
}: JseSwitchProps) {
  return (
    <button
      {...rest}
      id={id}
      type="button"
      className={["jse-switch", className ?? ""].filter(Boolean).join(" ")}
      role="switch"
      aria-checked={modelValue}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onModelValueChange?.(!modelValue);
      }}
    >
      <span className="jse-switch__track" aria-hidden="true">
        <span className="jse-switch__thumb" />
      </span>
    </button>
  );
}
