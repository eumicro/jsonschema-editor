import { useMemo } from "react";
import type { ObjectSchema } from "@jsonschema-editor/json-schema";
import { buildPropertyScope } from "@jsonschema-editor/ui-schema";
import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useScopedField } from "../../../hooks/useScopedField.js";
import { isSchemaFieldHidden, isSchemaFieldReadOnly } from "../../../utils/field-behavior.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { SchemaFormFieldResolver } from "./SchemaFormFieldResolver.js";

export function ObjectFormField(props: FormFieldProps) {
  const { schema, document, scope, label, i18nKey, readonly, data, onDataChange } = props;
  const { fieldSchema } = useScopedField(schema, scope, document);
  const { displayLabel } = useFormFieldLabel(schema, scope, label, fieldSchema, i18nKey);

  const objectSchema = useMemo((): ObjectSchema | undefined => {
    const node = fieldSchema;
    return node?.nodeKind === "object" ? (node as ObjectSchema) : undefined;
  }, [fieldSchema]);

  const properties = useMemo(() => {
    if (!objectSchema) return [];
    return [...objectSchema.properties.entries()];
  }, [objectSchema]);

  if (!objectSchema || isSchemaFieldHidden(fieldSchema)) return null;

  const effectiveReadonly = isSchemaFieldReadOnly(fieldSchema, readonly);

  return (
    <fieldset className="jse-group jse-object-field">
      {displayLabel ? <legend>{displayLabel}</legend> : null}
      {properties.map(([name]) => (
        <SchemaFormFieldResolver
          key={`${scope}-${name}`}
          schema={schema}
          document={document}
          scope={buildPropertyScope(scope, name)}
          readonly={effectiveReadonly}
          data={data}
          onDataChange={onDataChange}
        />
      ))}
    </fieldset>
  );
}
