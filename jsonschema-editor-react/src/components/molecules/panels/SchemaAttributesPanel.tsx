import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { JseCheckbox } from "../../atoms/JseCheckbox.js";
import { JseInput } from "../../atoms/JseInput.js";
import { JseSelect } from "../../atoms/JseSelect.js";
import { JseFormField } from "../JseFormField.js";
import { ArrayItemsTypeControl } from "../ArrayItemsTypeControl.js";
import { AttributeControlResolver } from "../attributes/AttributeControlResolver.js";
import { SchemaFieldBulkActions } from "./SchemaFieldBulkActions.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { useSchemaAttributesPanel } from "../../../hooks/useSchemaAttributesPanel.js";
import type { SchemaPath } from "../../../utils/schema-editor.js";

export interface SchemaAttributesPanelProps {
  document: SchemaDocument;
  selectedPath: SchemaPath;
  onDocumentChange: (document: SchemaDocument) => void;
  onSelectedPathChange: (path: SchemaPath) => void;
}

export function SchemaAttributesPanel({
  document,
  selectedPath,
  onDocumentChange,
  onSelectedPathChange,
}: SchemaAttributesPanelProps) {
  const { t } = useJseI18n();

  const {
    propertyNameInput,
    setPropertyNameInput,
    propertyNameError,
    setPropertyNameError,
    selectedDefRef,
    setSelectedDefRef,
    selectedNode,
    isRefNode,
    isDefRoot,
    availableDefs,
    parentObject,
    propertyName,
    showPropertyName,
    attributeFields,
    isRequired,
    showItemsTypeControl,
    itemsTypeKind,
    showBulkFieldActions,
    commitPropertyRename,
    readAttribute,
    updateAttribute,
    setRequired,
    commitRefChange,
    setItemsType,
    applyBulkFieldAttribute,
  } = useSchemaAttributesPanel(document, selectedPath, {
    onDocumentChange,
    onSelectedPathChange,
  });

  return (
    <div className="jse-attributes-panel">
      {showPropertyName ? (
        <JseFormField
          label={
            isDefRoot ? t("schemaAttributes.defName") : t("schemaAttributes.fieldName")
          }
        >
          <JseInput
            modelValue={propertyNameInput}
            placeholder={
              isDefRoot
                ? t("schemaAttributes.defNamePlaceholder")
                : t("schemaAttributes.fieldNamePlaceholder")
            }
            onModelValueChange={(value) => {
              setPropertyNameInput(String(value));
              setPropertyNameError("");
            }}
            onBlur={commitPropertyRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                (event.target as HTMLInputElement).blur();
              }
            }}
          />
          {propertyNameError ? (
            <p className="jse-element-actions__error">{propertyNameError}</p>
          ) : null}
        </JseFormField>
      ) : null}

      {isRefNode ? (
        <JseFormField label={t("schemaAttributes.ref")}>
          <JseSelect
            modelValue={selectedDefRef}
            className="jse-field__input"
            onModelValueChange={(value) => {
              setSelectedDefRef(String(value));
              commitRefChange();
            }}
          >
            {availableDefs.map((name) => (
              <option key={name} value={name}>
                #/$defs/{name}
              </option>
            ))}
          </JseSelect>
        </JseFormField>
      ) : null}

      {attributeFields.map((field) => (
        <AttributeControlResolver
          key={field.name}
          node={selectedNode}
          attributeName={field.name}
          label={t(field.labelKey)}
          mode="schema"
          document={document}
          modelValue={readAttribute(field.name)}
          onModelValueChange={(value) => updateAttribute(field.name, value)}
        />
      ))}

      {parentObject && propertyName && !isDefRoot ? (
        <JseFormField boolean label={t("schemaAttributes.required")}>
          <JseCheckbox modelValue={isRequired} onModelValueChange={setRequired} />
        </JseFormField>
      ) : null}

      {showItemsTypeControl ? (
        <JseFormField label={t("schemaAttributes.itemsType")}>
          <ArrayItemsTypeControl
            compact
            currentKind={itemsTypeKind}
            onSelect={setItemsType}
          />
        </JseFormField>
      ) : null}

      {showBulkFieldActions ? (
        <SchemaFieldBulkActions onApply={applyBulkFieldAttribute} />
      ) : null}
    </div>
  );
}
