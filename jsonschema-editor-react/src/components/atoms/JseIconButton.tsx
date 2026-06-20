import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface JseIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "default" | "primary" | "danger";
  children: ReactNode;
}

export function JseIconButton({
  label,
  variant = "default",
  className,
  children,
  ...rest
}: JseIconButtonProps) {
  return (
    <button
      {...rest}
      type="button"
      className={[
        "jse-icon-btn",
        variant === "primary" ? "jse-icon-btn--primary" : "",
        variant === "danger" ? "jse-icon-btn--danger" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
