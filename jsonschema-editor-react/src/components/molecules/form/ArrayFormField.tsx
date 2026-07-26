import { useEffect, useMemo } from "react";
import type { ArraySchema } from "@jsonschema-editor/json-schema";
import { buildArrayItemScope } from "@jsonschema-editor/json-schema";
import { resolveControlDetailSchema } from "@jsonschema-editor/ui-schema";
import { useFormFieldLabel } from "../../../hooks/useFormFieldLabel.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { useArrayFieldValue, useScopedField } from "../../../hooks/useScopedField.js";
import {
  getArrayItemLabelValue,
  resolveItemLabelProp,
  setArrayItemLabelValue,
} from "../../../utils/array-item-label.js";
import { isSchemaFieldHidden, isSchemaFieldReadOnly } from "../../../utils/field-behavior.js";
import type { FormFieldProps } from "../../../types/form-field-props.js";
import { JseButton } from "../../atoms/JseButton.js";
import { SchemaFormFieldResolver } from "./SchemaFormFieldResolver.js";
import { UiFormElementResolver } from "../ui/UiFormElementResolver.js";

export type ArrayFormFieldProps = FormFieldProps;

export function ArrayFormField(props: ArrayFormFieldProps) {
  const {
    schema,
    document,
    scope,
    label,
    i18nKey,
    readonly,
    data,
    onDataChange,
    detail,
    elementLabelProp,
    controlOptions,
  } = props;
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

  const itemSchema = useMemo(
    () => resolveControlDetailSchema(document ?? null, scope),
    [document, scope],
  );

  const labelProp = useMemo(
    () =>
      resolveItemLabelProp(
        elementLabelProp !== undefined ? { elementLabelProp } : controlOptions,
        itemSchema,
      ),
    [controlOptions, elementLabelProp, itemSchema],
  );

  useEffect(() => {
    if (arraySchema && !Array.isArray(items)) {
      setItems([]);
    }
  }, [arraySchema, items, setItems]);

  if (!arraySchema?.supportsDynamicItems() || isSchemaFieldHidden(fieldSchema)) return null;

  const effectiveReadonly = isSchemaFieldReadOnly(fieldSchema, readonly);
  const canAdd = !effectiveReadonly && arraySchema.canAddItem(items.length);
  const canRemove = !effectiveReadonly && arraySchema.canRemoveItem(items.length);

  function itemTitle(index: number): string {
    if (!labelProp) return t("arrayList.itemTitle", { index: index + 1 });
    const value = getArrayItemLabelValue(items[index], labelProp).trim();
    return value || t("arrayList.itemTitle", { index: index + 1 });
  }

  function onItemLabelInput(index: number, value: string): void {
    if (!labelProp || effectiveReadonly) return;
    const next = [...items];
    next[index] = setArrayItemLabelValue(next[index], labelProp, value);
    setItems(next);
  }

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
            {labelProp ? (
              <input
                type="text"
                className="jse-array-item__title-input"
                value={getArrayItemLabelValue(items[index], labelProp)}
                placeholder={t("arrayList.itemTitle", { index: index + 1 })}
                readOnly={effectiveReadonly}
                aria-label={t("arrayList.itemLabelAria", { index: index + 1 })}
                onChange={(event) => onItemLabelInput(index, event.target.value)}
              />
            ) : (
              <span className="jse-array-item__title">{itemTitle(index)}</span>
            )}
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
          {detail ? (
            <UiFormElementResolver
              element={detail}
              schema={schema}
              document={document}
              data={data}
              onDataChange={onDataChange}
              readonly={effectiveReadonly}
              scopePrefix={buildArrayItemScope(scope, index)}
            />
          ) : (
            <SchemaFormFieldResolver
              schema={schema}
              document={document}
              scope={buildArrayItemScope(scope, index)}
              readonly={effectiveReadonly}
              data={data}
              onDataChange={onDataChange}
            />
          )}
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
