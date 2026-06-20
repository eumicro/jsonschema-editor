import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  type FormEvent,
} from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { FormDataProvider } from "../../context/FormDataContext.js";
import {
  FormValidationProvider,
  useFormValidation,
  type FormValidationMode,
} from "../../context/FormValidationContext.js";
import { JseI18nProvider, resolveJseI18nOptions } from "../../context/JseI18nContext.js";
import { RegistriesProvider } from "../../context/RegistriesContext.js";
import type { JseI18nOptions } from "../../i18n/types.js";
import { registerDefaultControls } from "../../registry/register-defaults.js";
import {
  setupJseReactExtensions,
  type JseReactExtension,
} from "../../registry/react-extension.js";
import { UiElementRenderer } from "../molecules/ui/UiFormElementResolver.js";
import "../../style.css";

registerDefaultControls();

export interface JsonSchemaFormProps {
  schema: SchemaDocument;
  uiSchema: UiSchema;
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  readonly?: boolean;
  locale?: JseI18nOptions["locale"];
  fallbackLocale?: JseI18nOptions["fallbackLocale"];
  messages?: JseI18nOptions["messages"];
  translate?: JseI18nOptions["translate"];
  extensions?: JseReactExtension[];
  validation?: boolean;
  validationMode?: FormValidationMode;
  onSubmit?: (payload: { valid: boolean }) => void;
  onValidated?: (payload: { valid: boolean }) => void;
}

export interface JsonSchemaFormHandle {
  validate: () => boolean;
}

export const JsonSchemaForm = forwardRef<JsonSchemaFormHandle, JsonSchemaFormProps>(
  function JsonSchemaForm(props, ref) {
    setupJseReactExtensions(props.extensions);

    const i18nOptions = useMemo(
      () =>
        resolveJseI18nOptions({
          locale: props.locale,
          fallbackLocale: props.fallbackLocale,
          messages: props.messages,
          translate: props.translate,
        }),
      [props.fallbackLocale, props.locale, props.messages, props.translate],
    );

    return (
      <JseI18nProvider options={i18nOptions}>
        <RegistriesProvider>
          <FormDataProvider data={props.data} onDataChange={props.onDataChange}>
            <FormValidationProvider
              schema={props.schema}
              data={props.data}
              enabled={props.validation !== false}
              mode={props.validationMode ?? "blur"}
            >
              <JsonSchemaFormBody {...props} ref={ref} />
            </FormValidationProvider>
          </FormDataProvider>
        </RegistriesProvider>
      </JseI18nProvider>
    );
  },
);

const JsonSchemaFormBody = forwardRef<JsonSchemaFormHandle, JsonSchemaFormProps>(
  function JsonSchemaFormBody(props, ref) {
    const validation = useFormValidation();
    const rootElement = props.uiSchema.root;

    useImperativeHandle(ref, () => ({
      validate: () => validation?.validateAll() ?? true,
    }));

    const handleSubmit = useCallback(
      (event: FormEvent) => {
        event.preventDefault();
        if (props.validation === false) {
          props.onSubmit?.({ valid: true });
          return;
        }
        const valid = validation?.validateAll() ?? true;
        props.onValidated?.({ valid });
        props.onSubmit?.({ valid });
      },
      [props, validation],
    );

    return (
      <form className="jse-form" noValidate onSubmit={handleSubmit}>
        <UiElementRenderer
          element={rootElement}
          schema={props.schema.root}
          document={props.schema}
          data={props.data}
          onDataChange={props.onDataChange}
          readonly={props.readonly}
        />
      </form>
    );
  },
);
