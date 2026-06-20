import type { ReactNode } from "react";
import { JseLabel } from "../atoms/JseLabel.js";

export interface JseFormFieldProps {
  label?: string;
  boolean?: boolean;
  children: ReactNode;
}

export function JseFormField({ label, boolean, children }: JseFormFieldProps) {
  return (
    <div
      className={[
        "jse-attribute-control",
        boolean ? "jse-attribute-control--boolean" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {boolean ? (
        <>
          {children}
          {label ? <JseLabel>{label}</JseLabel> : null}
        </>
      ) : (
        <>
          {label ? <JseLabel>{label}</JseLabel> : null}
          {children}
        </>
      )}
    </div>
  );
}
