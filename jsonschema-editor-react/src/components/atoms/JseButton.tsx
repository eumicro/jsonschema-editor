import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface JseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger";
  children: ReactNode;
}

export function JseButton({
  type = "button",
  variant = "default",
  className,
  children,
  ...rest
}: JseButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[
        "jse-btn",
        variant === "danger" ? "jse-btn--danger" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
