import { useEffect, useMemo, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import {
  ArraySchema,
  CompositionSchema,
  ObjectSchema,
} from "@jsonschema-editor/json-schema";
import { ArrayItemsTypeControl } from "./ArrayItemsTypeControl.js";
import { JseButton } from "../atoms/JseButton.js";
import { JseInput } from "../atoms/JseInput.js";
import { JseLabel } from "../atoms/JseLabel.js";
import { JseSelect } from "../atoms/JseSelect.js";
import {
  addCompositionBranchRef,
  addCompositionBranchToDocument,
  addDefinition,
  addObjectPropertyRef,
  addObjectPropertyToDocument,
  canAddToDefsContainer,
  getDocumentKindLabel,
  getDocumentNodeLabel,
  tryGetNodeAtPath,
  setArrayItemsInDocument,
  setPropertyKindInDocument,
  suggestDefName,
} from "../../utils/schema-document.js";
import { getArrayItemsKind, suggestPropertyName, type SchemaPath } from "../../utils/schema-editor.js";
import {
  listObjectPropertyTypeOptions,
  listSchemaChangeTypeOptions,
} from "../../utils/schema-editor-types.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

export interface SchemaElementActionsProps {
  document: SchemaDocument;
  targetPath: SchemaPath;
  onDocumentChange: (document: SchemaDocument) => void;
  onDone: () => void;
  onItemsSet?: (arrayPath: SchemaPath, kind: string) => void;
}

const compositionOperators = ["allOf", "anyOf", "oneOf"] as const;

export function SchemaElementActions({
  document,
  targetPath,
  onDocumentChange,
  onDone,
  onItemsSet,
}: SchemaElementActionsProps) {
  const { t } = useJseI18n();
  const propertyTypeOptions = listObjectPropertyTypeOptions();
  const schemaChangeTypeOptions = listSchemaChangeTypeOptions();

  const [newPropertyName, setNewPropertyName] = useState("");
  const [newDefName, setNewDefName] = useState("");
  const [propertyNameError, setPropertyNameError] = useState("");
  const [defNameError, setDefNameError] = useState("");
  const [selectedDefRef, setSelectedDefRef] = useState("");

  const targetNode = tryGetNodeAtPath(document, targetPath);
  const targetLabel = targetNode
    ? getDocumentNodeLabel(targetNode, targetPath)
    : targetPath.join(".");
  const targetKindLabel = targetNode ? getDocumentKindLabel(targetNode) : "";
  const availableDefs = useMemo(() => document.listDefNames(), [document]);

  const isDefsContainer = canAddToDefsContainer(targetPath);
  const canAddProperty = targetNode instanceof ObjectSchema;
  const canAddBranch =
    targetNode instanceof CompositionSchema ||
    (targetPath.length === 0 && targetNode && !(targetNode instanceof ArraySchema));
  const isArray = targetNode instanceof ArraySchema;
  const arrayItemsKind = isArray ? getArrayItemsKind(targetNode) : undefined;
  const canChangeKind =
    targetPath.length > 0 &&
    !isArray &&
    !(targetNode instanceof CompositionSchema) &&
    !isDefsContainer;
  const canUseDefRef = availableDefs.length > 0 && (canAddProperty || canAddBranch);

  useEffect(() => {
    setPropertyNameError("");
    setDefNameError("");
    setSelectedDefRef(availableDefs[0] ?? "");
    if (targetNode instanceof ObjectSchema) {
      setNewPropertyName(suggestPropertyName(targetNode));
    } else {
      setNewPropertyName("");
    }
    if (isDefsContainer) {
      setNewDefName(suggestDefName(document));
    }
  }, [availableDefs, document, isDefsContainer, targetNode, targetPath]);

  function patch(next: SchemaDocument, close = true) {
    onDocumentChange(next);
    if (close) onDone();
  }

  function addProperty(kind: string) {
    if (!(targetNode instanceof ObjectSchema)) return;

    const name = newPropertyName.trim();
    if (!name) {
      setPropertyNameError(t("validation.propertyNameRequired"));
      return;
    }
    if (targetNode.getProperty(name)) {
      setPropertyNameError(t("validation.propertyNameExists", { name }));
      return;
    }

    const next = addObjectPropertyToDocument(document, targetPath, kind, name);
    if (next === document) {
      setPropertyNameError(t("validation.propertyNameExists", { name }));
      return;
    }

    setPropertyNameError("");
    patch(next);
  }

  function addPropertyFromDef() {
    if (!selectedDefRef || !(targetNode instanceof ObjectSchema)) return;

    const name = newPropertyName.trim();
    if (!name) {
      setPropertyNameError(t("validation.propertyNameRequired"));
      return;
    }

    const next = addObjectPropertyRef(document, targetPath, selectedDefRef, name);
    if (next === document) {
      setPropertyNameError(t("validation.propertyNameExists", { name }));
      return;
    }

    setPropertyNameError("");
    patch(next);
  }

  function addDef(kind: string) {
    const name = newDefName.trim();
    if (!name) {
      setDefNameError(t("validation.defNameRequired"));
      return;
    }
    if (document.hasDef(name)) {
      setDefNameError(t("validation.defNameExists", { name }));
      return;
    }

    setDefNameError("");
    patch(addDefinition(document, kind, name));
  }

  function addBranch(operator: "allOf" | "anyOf" | "oneOf") {
    patch(addCompositionBranchToDocument(document, targetPath, operator));
  }

  function addBranchFromDef(operator: "allOf" | "anyOf" | "oneOf") {
    if (!selectedDefRef) return;
    patch(addCompositionBranchRef(document, targetPath, operator, selectedDefRef));
  }

  function setItems(kind: string) {
    const next = setArrayItemsInDocument(document, targetPath, kind);
    onDocumentChange(next);
    onItemsSet?.(targetPath, kind);
    const close = kind !== "object" && kind !== "array";
    if (close) onDone();
  }

  function changeKind(kind: string) {
    patch(setPropertyKindInDocument(document, targetPath, kind));
  }

  return (
    <div className="jse-element-actions">
      <p className="jse-element-actions__target">
        {t("elementActions.target")} <strong>{targetLabel}</strong>
        <span className="jse-element-actions__kind">({targetKindLabel})</span>
      </p>

      {isDefsContainer ? (
        <div className="jse-element-actions__section">
          <div className="jse-attribute-control">
            <JseLabel>{t("elementActions.defName")}</JseLabel>
            <JseInput
              modelValue={newDefName}
              placeholder={t("elementActions.defNamePlaceholder")}
              onModelValueChange={(value) => {
                setNewDefName(String(value));
                setDefNameError("");
              }}
            />
          </div>
          {defNameError ? <p className="jse-element-actions__error">{defNameError}</p> : null}
          <span className="jse-structure-editor__hint">{t("elementActions.type")}</span>
          <div className="jse-structure-editor__buttons">
            {propertyTypeOptions.map((option) => (
              <JseButton key={`def-${option.id}`} type="button" onClick={() => addDef(option.id)}>
                + {option.label}
              </JseButton>
            ))}
          </div>
        </div>
      ) : null}

      {canAddProperty ? (
        <div className="jse-element-actions__section">
          <div className="jse-attribute-control">
            <JseLabel>{t("elementActions.fieldName")}</JseLabel>
            <JseInput
              modelValue={newPropertyName}
              placeholder={t("elementActions.fieldNamePlaceholder")}
              onModelValueChange={(value) => {
                setNewPropertyName(String(value));
                setPropertyNameError("");
              }}
            />
          </div>
          {propertyNameError ? (
            <p className="jse-element-actions__error">{propertyNameError}</p>
          ) : null}
          <span className="jse-structure-editor__hint">{t("elementActions.type")}</span>
          <div className="jse-structure-editor__buttons">
            {propertyTypeOptions.map((option) => (
              <JseButton
                key={option.id}
                type="button"
                onClick={() => addProperty(option.id)}
              >
                + {option.label}
              </JseButton>
            ))}
          </div>
        </div>
      ) : null}

      {canUseDefRef ? (
        <div className="jse-element-actions__section">
          <span className="jse-structure-editor__hint">{t("elementActions.ref")}</span>
          <JseSelect
            modelValue={selectedDefRef}
            className="jse-field__input"
            onModelValueChange={(value) => setSelectedDefRef(String(value))}
          >
            {availableDefs.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </JseSelect>
          <div className="jse-structure-editor__buttons">
            {canAddProperty ? (
              <JseButton type="button" onClick={addPropertyFromDef}>
                {t("elementActions.refAsProperty")}
              </JseButton>
            ) : null}
            {canAddBranch
              ? compositionOperators.map((op) => (
                  <JseButton key={`ref-${op}`} type="button" onClick={() => addBranchFromDef(op)}>
                    {t("elementActions.refInComposition", { operator: op })}
                  </JseButton>
                ))
              : null}
          </div>
        </div>
      ) : null}

      {canAddBranch ? (
        <div className="jse-element-actions__section">
          <span className="jse-structure-editor__hint">
            {t("elementActions.compositionBranch")}
          </span>
          <div className="jse-structure-editor__buttons">
            {compositionOperators.map((op) => (
              <JseButton key={op} type="button" onClick={() => addBranch(op)}>
                + {op}
              </JseButton>
            ))}
          </div>
        </div>
      ) : null}

      {isArray ? (
        <div className="jse-element-actions__section">
          <span className="jse-structure-editor__hint">{t("elementActions.setItemsType")}</span>
          <ArrayItemsTypeControl currentKind={arrayItemsKind} onSelect={setItems} />
        </div>
      ) : null}

      {canChangeKind ? (
        <div className="jse-element-actions__section">
          <span className="jse-structure-editor__hint">{t("elementActions.changeType")}</span>
          <div className="jse-structure-editor__buttons">
            {schemaChangeTypeOptions.map((option) => (
              <JseButton
                key={`change-${option.id}`}
                type="button"
                onClick={() => changeKind(option.id)}
              >
                → {option.label}
              </JseButton>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
