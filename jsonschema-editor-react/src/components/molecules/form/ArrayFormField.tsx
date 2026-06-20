import { useEffect, useMemo } from "react";
import type { ArraySchema } from "@jsonschema-editor/json-schema";
import { buildArrayItemScope } from "@jsonschema-editor/json-schema";
import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { useArrayFieldValue, useScopedField } from "../../../hooks/useScopedField.js";
import { isSchemaFieldHidden, isSchemaFieldReadOnly } from "../../../utils/field-behavior.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseButton } from "../../atoms/JseButton.js";
import { SchemaFormFieldResolver } from "./SchemaFormFieldResolver.js";

export function ArrayFormField(props: FormFieldProps) {
  const { schema, document, scope, label, i18nKey, readonly, data, onDataChange } = props;
  const { t } = useJseI18n();
  const { fieldSchema } = useScopedField(schema, scope, document);
  const { displayLabel, description } = useFormFieldLabel(
    schema,
    scope,
    label,
    fieldSchema,
    i18nKey,
  );
  const { items, setItems } = useArrayFieldValue(scope);

  const arraySchema = useMemo((): ArraySchema | undefined => {
    const node = fieldSchema;
    return node?.nodeKind === "array" ? (node as ArraySchema) : undefined;
  }, [fieldSchema]);

  useEffect(() => {
    if (arraySchema && !Array.isArray(items)) {
      setItems([]);
    }
  }, [arraySchema, items, setItems]);

  if (!arraySchema?.supportsDynamicItems() || isSchemaFieldHidden(fieldSchema)) return null;

  const effectiveReadonly = isSchemaFieldReadOnly(fieldSchema, readonly);
  const canAdd = !effectiveReadonly && arraySchema.canAddItem(items.length);
  const canRemove = !effectiveReadonly && arraySchema.canRemoveItem(items.length);

  function addItem() {
    if (!arraySchema || !canAdd) return;
    setItems([...items, arraySchema.createDefaultItemValue(items.length)]);
  }

  function removeItem(index: number) {
    if (!canRemove) return;
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <fieldset className="jse-group jse-array-field">
      {displayLabel ? <legend>{displayLabel}</legend> : null}
      {description ? <p className="jse-field__hint">{description}</p> : null}

      {items.length === 0 ? (
        <p className="jse-array-field__empty">{t("arrayList.empty")}</p>
      ) : null}

      {items.map((_, index) => (
        <article key={`${scope}-item-${index}-of-${items.length}`} className="jse-array-item">
          <header className="jse-array-item__header">
            <span className="jse-array-item__title">
              {t("arrayList.itemTitle", { index: index + 1 })}
            </span>
            {canRemove ? (
              <JseButton
                type="button"
                className="jse-array-item__remove"
                onClick={() => removeItem(index)}
              >
                {t("arrayList.removeItem")}
              </JseButton>
            ) : null}
          </header>
          <SchemaFormFieldResolver
            schema={schema}
            document={document}
            scope={buildArrayItemScope(scope, index)}
            readonly={effectiveReadonly}
            data={data}
            onDataChange={onDataChange}
          />
        </article>
      ))}

      {canAdd ? (
        <JseButton type="button" className="jse-array-field__add" onClick={addItem}>
          {t("arrayList.addItem")}
        </JseButton>
      ) : null}
    </fieldset>
  );
}
