import {
  computed,
  inject,
  provide,
  ref,
  shallowRef,
  watch,
  type InjectionKey,
  type Ref,
} from "vue";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { ValidateFunction } from "ajv";
import { useJseI18n } from "./useJseI18n.js";
import {
  createFormValidator,
  validateFormData,
  type FormValidationTranslate,
} from "../validation/schema-validator.js";

export type FormValidationMode = "blur" | "change";

export interface FormValidationContext {
  enabled: Ref<boolean>;
  mode: Ref<FormValidationMode>;
  isValid: Ref<boolean>;
  submitted: Ref<boolean>;
  validateAll: () => boolean;
  getFieldError: (scope: string) => string | undefined;
  touchField: (scope: string) => void;
  onFieldBlur: (scope: string) => void;
}

export const FORM_VALIDATION_KEY: InjectionKey<FormValidationContext> = Symbol("jseFormValidation");

export interface SetupFormValidationOptions {
  schema: Ref<SchemaDocument>;
  data: Ref<Record<string, unknown>>;
  enabled?: Ref<boolean>;
  mode?: Ref<FormValidationMode>;
}

export function setupFormValidation(options: SetupFormValidationOptions): FormValidationContext {
  const { t } = useJseI18n();
  const enabled = options.enabled ?? ref(true);
  const mode = options.mode ?? ref<FormValidationMode>("blur");
  const submitted = ref(false);
  const touchedScopes = ref(new Set<string>());
  const errorsByScope = ref(new Map<string, string[]>());
  const validator = shallowRef<ValidateFunction | null>(null);

  const translate: FormValidationTranslate = (key, params) => t(key, params);

  function recompileValidator() {
    try {
      validator.value = createFormValidator(options.schema.value.toJSON());
    } catch {
      validator.value = null;
      errorsByScope.value = new Map();
    }
  }

  watch(() => options.schema.value, recompileValidator, { immediate: true });

  function runValidation(): Map<string, string[]> {
    if (!enabled.value || !validator.value) {
      return new Map();
    }
    return validateFormData(validator.value, options.data.value, translate, options.schema.value);
  }

  function validateAll(): boolean {
    errorsByScope.value = runValidation();
    return errorsByScope.value.size === 0;
  }

  watch(
    () => options.data.value,
    () => {
      if (!enabled.value) return;
      if (mode.value === "change" || submitted.value) {
        errorsByScope.value = runValidation();
      }
    },
    { deep: true },
  );

  function getFieldError(scope: string): string | undefined {
    if (!enabled.value) return undefined;
    const messages = errorsByScope.value.get(scope);
    if (!messages?.length) return undefined;
    if (mode.value === "change" || submitted.value || touchedScopes.value.has(scope)) {
      return messages[0];
    }
    return undefined;
  }

  function touchField(scope: string): void {
    touchedScopes.value = new Set(touchedScopes.value).add(scope);
  }

  function onFieldBlur(scope: string): void {
    if (!enabled.value) return;
    touchField(scope);
    if (mode.value === "blur" || submitted.value) {
      errorsByScope.value = runValidation();
    }
  }

  const isValid = computed(() => errorsByScope.value.size === 0);

  const context: FormValidationContext = {
    enabled,
    mode,
    isValid,
    submitted,
    validateAll,
    getFieldError,
    touchField,
    onFieldBlur,
  };

  provide(FORM_VALIDATION_KEY, context);
  return context;
}

export function useFormValidation(): FormValidationContext | undefined {
  return inject(FORM_VALIDATION_KEY, undefined);
}

export function useFieldValidation(scope: () => string) {
  const context = useFormValidation();

  const error = computed(() => context?.getFieldError(scope()));

  function onBlur() {
    context?.onFieldBlur(scope());
  }

  return { error, onBlur, hasValidation: computed(() => !!context?.enabled.value) };
}
