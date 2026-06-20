import type { ReactNode } from "react";

export interface JseLabelProps {
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}

export function JseLabel({ htmlFor, hint, children }: JseLabelProps) {
  return (
    <label className="jse-label" htmlFor={htmlFor}>
      <span className="jse-label__text">{children}</span>
      {hint ? <span className="jse-label__hint">{hint}</span> : null}
    </label>
  );
}
