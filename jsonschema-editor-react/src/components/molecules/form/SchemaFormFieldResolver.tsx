import type { ComponentType } from "react";
import { useMemo } from "react";
import { resolveCompositionAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { useSchemaFormTypeRegistry } from "../../../context/RegistriesContext.js";
import { createFormFieldMatchContext } from "../../../registry/form-field-context.js";
import { isSchemaFieldHidden, isSchemaFieldReadOnly } from "../../../utils/field-behavior.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import { DefaultFormField } from "./DefaultFormField.js";
import { OneOfFormField } from "./OneOfFormField.js";

export function SchemaFormFieldResolver(props: FormFieldProps) {
  const typeRegistry = useSchemaFormTypeRegistry();
  const { fieldSchema } = useScopedField(props.schema, props.scope, props.document);

  const oneOfComposition = useMemo(() => {
    const resolveRef = props.document
      ? (ref: string) => props.document!.resolveRef(ref)
      : undefined;
    return resolveCompositionAtScope(props.schema, props.scope, resolveRef);
  }, [props.document, props.schema, props.scope]);

  const matchContext = useMemo(
    () =>
      createFormFieldMatchContext({
        scope: props.scope,
        label: props.label,
        i18nKey: props.i18nKey,
        readonly: props.readonly,
        fieldSchema,
        rootSchema: props.schema,
      }),
    [fieldSchema, props.i18nKey, props.label, props.readonly, props.schema, props.scope],
  );

  if (isSchemaFieldHidden(fieldSchema)) {
    return null;
  }

  const readonly = isSchemaFieldReadOnly(fieldSchema, props.readonly);
  const node = fieldSchema ?? props.schema;
  const Resolved = oneOfComposition
    ? OneOfFormField
    : ((typeRegistry.resolve(node, matchContext) as ComponentType<FormFieldProps>) ??
      DefaultFormField);

  return <Resolved {...props} readonly={readonly} />;
}
