import { useMemo } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { JseFormField } from "./JseFormField.js";
import { JseSuggestionInput } from "../atoms/JseSuggestionInput.js";
import {
  isControlScopeInUse,
  listControlScopeSuggestions,
} from "../../utils/control-scope-suggestions.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

export interface ControlScopeFieldProps {
  document?: SchemaDocument | null;
  /** Scopes, die aus der Suggestion-Liste ausgeblendet werden. */
  usedScopes?: readonly string[];
  /** Scopes, die eine „bereits in Verwendung“-Warnung auslösen (Standard: usedScopes). */
  conflictScopes?: readonly string[];
  modelValue: string;
  onModelValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ControlScopeField({
  document,
  usedScopes = [],
  conflictScopes,
  modelValue,
  onModelValueChange,
  label,
  placeholder,
  disabled,
}: ControlScopeFieldProps) {
  const { t } = useJseI18n();

  const suggestions = useMemo(
    () =>
      listControlScopeSuggestions(document, {
        excludeScopes: usedScopes,
      }).map((entry) => ({
        value: entry.scope,
        label: entry.display,
      })),
    [document, usedScopes],
  );

  const scopeInUse = isControlScopeInUse(modelValue, conflictScopes ?? usedScopes);

  return (
    <JseFormField label={label ?? t("uiAttributes.scope")}>
      <JseSuggestionInput
        modelValue={modelValue}
        onModelValueChange={onModelValueChange}
        suggestions={suggestions}
        disabled={disabled}
        placeholder={placeholder ?? t("uiAttributes.scopeSuggestionPlaceholder")}
        className={scopeInUse ? "jse-suggestion-input--warning" : undefined}
      />
      {scopeInUse ? (
        <p className="jse-scope-warning" role="alert">
          {t("uiAttributes.scopeAlreadyInUse", { scope: modelValue.trim() })}
        </p>
      ) : suggestions.length > 0 ? (
        <p className="jse-structure-editor__hint">{t("uiAttributes.scopeSuggestionHint")}</p>
      ) : (
        <p className="jse-structure-editor__hint">{t("uiAttributes.scopeSuggestionEmpty")}</p>
      )}
    </JseFormField>
  );
}
