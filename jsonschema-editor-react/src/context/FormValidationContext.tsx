import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { ValidateFunction } from "ajv";
import { useJseI18n } from "./JseI18nContext.js";
import {
  createFormValidator,
  validateFormData,
  type FormValidationTranslate,
} from "../validation/schema-validator.js";

export type FormValidationMode = "blur" | "change";

export interface FormValidationContextValue {
  enabled: boolean;
  mode: FormValidationMode;
  isValid: boolean;
  submitted: boolean;
  validateAll: () => boolean;
  getFieldError: (scope: string) => string | undefined;
  touchField: (scope: string) => void;
  onFieldBlur: (scope: string) => void;
}

const FormValidationContext = createContext<FormValidationContextValue | null>(null);

export interface FormValidationProviderProps {
  schema: SchemaDocument;
  data: Record<string, unknown>;
  enabled?: boolean;
  mode?: FormValidationMode;
  children: ReactNode;
}

export function FormValidationProvider({
  schema,
  data,
  enabled = true,
  mode = "blur",
  children,
}: FormValidationProviderProps) {
  const { t } = useJseI18n();
  const [submitted, setSubmitted] = useState(false);
  const [touchedScopes, setTouchedScopes] = useState<Set<string>>(() => new Set());
  const [errorsByScope, setErrorsByScope] = useState<Map<string, string[]>>(() => new Map());
  const validatorRef = useRef<ValidateFunction | null>(null);

  const translate: FormValidationTranslate = useCallback(
    (key, params) => t(key, params),
    [t],
  );

  useEffect(() => {
    try {
      validatorRef.current = createFormValidator(schema.toJSON());
    } catch {
      validatorRef.current = null;
      setErrorsByScope(new Map());
    }
  }, [schema]);

  const runValidation = useCallback((): Map<string, string[]> => {
    if (!enabled || !validatorRef.current) {
      return new Map();
    }
    return validateFormData(validatorRef.current, data, translate, schema);
  }, [data, enabled, schema, translate]);

  const validateAll = useCallback((): boolean => {
    const next = runValidation();
    setErrorsByScope(next);
    return next.size === 0;
  }, [runValidation]);

  useEffect(() => {
    if (!enabled) return;
    if (mode === "change" || submitted) {
      setErrorsByScope(runValidation());
    }
  }, [data, enabled, mode, runValidation, submitted]);

  const getFieldError = useCallback(
    (scope: string): string | undefined => {
      if (!enabled) return undefined;
      const messages = errorsByScope.get(scope);
      if (!messages?.length) return undefined;
      if (mode === "change" || submitted || touchedScopes.has(scope)) {
        return messages[0];
      }
      return undefined;
    },
    [enabled, errorsByScope, mode, submitted, touchedScopes],
  );

  const touchField = useCallback((scope: string) => {
    setTouchedScopes((prev) => new Set(prev).add(scope));
  }, []);

  const onFieldBlur = useCallback(
    (scope: string) => {
      if (!enabled) return;
      touchField(scope);
      if (mode === "blur" || submitted) {
        setErrorsByScope(runValidation());
      }
    },
    [enabled, mode, runValidation, submitted, touchField],
  );

  const value = useMemo<FormValidationContextValue>(
    () => ({
      enabled,
      mode,
      isValid: errorsByScope.size === 0,
      submitted,
      validateAll: () => {
        setSubmitted(true);
        return validateAll();
      },
      getFieldError,
      touchField,
      onFieldBlur,
    }),
    [
      enabled,
      errorsByScope.size,
      getFieldError,
      mode,
      onFieldBlur,
      submitted,
      touchField,
      validateAll,
    ],
  );

  return (
    <FormValidationContext.Provider value={value}>{children}</FormValidationContext.Provider>
  );
}

export function useFormValidation(): FormValidationContextValue | null {
  return useContext(FormValidationContext);
}

export function useFieldValidation(scope: string) {
  const context = useFormValidation();
  const error = context?.getFieldError(scope);
  const onBlur = () => context?.onFieldBlur(scope);
  return { error, onBlur, hasValidation: !!context?.enabled };
}
