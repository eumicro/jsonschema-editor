import { useMemo } from "react";
import { composeScope, type Control } from "@jsonschema-editor/ui-schema";
import { resolveSchemaAtScope } from "@jsonschema-editor/ui-schema/bridge";
import { useScopedField } from "../../../hooks/useScopedField.js";
import { readElementLabelProp } from "../../../utils/array-item-label.js";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { SchemaFormFieldResolver } from "../form/SchemaFormFieldResolver.js";
import { UiFormElementResolver } from "./UiFormElementResolver.js";

export interface ControlUiElementProps extends UiElementRendererProps {
  element: Control;
}

export function ControlUiElement({
  element,
  schema,
  document,
  data,
  onDataChange,
  readonly,
  scopePrefix,
}: ControlUiElementProps) {
  const composedScope = useMemo(
    () => (scopePrefix ? composeScope(scopePrefix, element.scope) : element.scope),
    [scopePrefix, element.scope],
  );

  const { fieldSchema } = useScopedField(schema, composedScope, document);

  const resolveRef = useMemo(
    () => (document ? (ref: string) => document.resolveRef(ref) : undefined),
    [document],
  );

  const isObjectField = useMemo(() => {
    const node = resolveSchemaAtScope(schema, composedScope, resolveRef);
    return node?.nodeKind === "object";
  }, [schema, composedScope, resolveRef]);

  const detail = element.detail;
  const elementLabelProp = readElementLabelProp(element.options);
  const isArrayField = fieldSchema?.nodeKind === "array";

  // Object controls with `options.detail` render the nested UI schema directly.
  if (detail && isObjectField && !isArrayField) {
    return (
      <UiFormElementResolver
        element={detail}
        schema={schema}
        document={document}
        data={data}
        onDataChange={onDataChange}
        readonly={readonly}
        scopePrefix={composedScope}
      />
    );
  }

  if (element.elementKind !== "Control" || !element.scope) {
    return null;
  }

  // Arrays (incl. x-file) go through the type registry so custom form fields
  // can win over ArrayFormField; detail/elementLabelProp are forwarded when
  // ArrayFormField is selected.
  return (
    <SchemaFormFieldResolver
      schema={schema}
      document={document}
      scope={composedScope}
      label={element.label}
      i18nKey={element.i18n}
      readonly={readonly}
      data={data}
      onDataChange={onDataChange}
      detail={detail}
      elementLabelProp={elementLabelProp}
      controlOptions={element.options}
    />
  );
}
