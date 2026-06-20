import type { ReactNode, FocusEvent } from "react";
import { useFieldValidation } from "../../../context/FormValidationContext.js";

export interface JseSchemaFormFieldProps {
  label: string;
  description?: string;
  scope?: string;
  boolean?: boolean;
  children?: ReactNode;
}

export function JseSchemaFormField({
  label,
  description,
  scope,
  boolean: isBoolean,
  children,
}: JseSchemaFormFieldProps) {
  const { error, onBlur } = useFieldValidation(scope ?? "");

  function onFieldBlur(event: FocusEvent<HTMLDivElement>) {
    if (!scope) return;
    const current = event.currentTarget;
    const next = event.relatedTarget as Node | null;
    if (!next || !current.contains(next)) {
      onBlur();
    }
  }

  return (
    <div
      className={`jse-field${error ? " jse-field--invalid" : ""}`}
      onBlur={onFieldBlur}
    >
      <label className="jse-field__label">
        {isBoolean ? (
          <>
            {children}
            {label}
          </>
        ) : (
          label
        )}
        {description ? <span className="jse-field__hint">{description}</span> : null}
      </label>
      {!isBoolean ? children : null}
      {error ? (
        <p className="jse-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
