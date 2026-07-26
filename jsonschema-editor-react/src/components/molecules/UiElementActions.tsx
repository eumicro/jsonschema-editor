import { useEffect, useMemo, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { JseButton } from "../atoms/JseButton.js";
import { ControlScopeField } from "./ControlScopeField.js";
import {
  canAcceptUiChild,
  createUiElement,
  getUiElementAt,
  getUiElementLabel,
  getUiInsertParentPath,
  insertUiElement,
  type UiPath,
} from "../../utils/ui-editor.js";
import {
  findControlScopeSuggestion,
  listControlScopeSuggestions,
  listUsedControlScopes,
} from "../../utils/control-scope-suggestions.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

export interface UiElementActionsProps {
  root: UiElement;
  targetPath: UiPath;
  document?: SchemaDocument | null;
  onRootChange: (root: UiElement) => void;
  onDone: () => void;
}

type UiLayoutElementKind =
  | "Group"
  | "VerticalLayout"
  | "HorizontalLayout"
  | "Label"
  | "Categorization"
  | "Category"
  | "Stepper"
  | "Step";

const uiLayoutElementKinds: UiLayoutElementKind[] = [
  "Group",
  "VerticalLayout",
  "HorizontalLayout",
  "Label",
  "Categorization",
  "Category",
  "Stepper",
  "Step",
];

export function UiElementActions({
  root,
  targetPath,
  document,
  onRootChange,
  onDone,
}: UiElementActionsProps) {
  const { t } = useJseI18n();
  const [controlScope, setControlScope] = useState("");

  const targetElement = useMemo(() => getUiElementAt(root, targetPath), [root, targetPath]);
  const targetLabel = getUiElementLabel(targetElement);
  const insertParentPath = useMemo(
    () => getUiInsertParentPath(root, targetPath),
    [root, targetPath],
  );
  const insertParent = useMemo(
    () => getUiElementAt(root, insertParentPath),
    [root, insertParentPath],
  );
  const usedScopes = useMemo(() => listUsedControlScopes(root), [root]);
  const availableSuggestions = useMemo(
    () => listControlScopeSuggestions(document, { excludeScopes: usedScopes }),
    [document, usedScopes],
  );
  const allSuggestions = useMemo(() => listControlScopeSuggestions(document), [document]);

  const compatibleKinds = useMemo(
    () =>
      uiLayoutElementKinds.filter((kind) =>
        canAcceptUiChild(insertParent, createUiElement(kind, { translate: t })),
      ),
    [insertParent, t],
  );

  const canAddControl = useMemo(
    () => canAcceptUiChild(insertParent, createUiElement("Control", { translate: t })),
    [insertParent, t],
  );

  useEffect(() => {
    if (!controlScope.trim()) {
      setControlScope(availableSuggestions[0]?.scope ?? "");
    }
  }, [availableSuggestions, controlScope, targetPath]);

  function addElement(kind: UiLayoutElementKind) {
    const element = createUiElement(kind, { translate: t });
    if (!canAcceptUiChild(insertParent, element)) return;
    onRootChange(insertUiElement(root, insertParentPath, element));
    onDone();
  }

  function addControl() {
    if (!canAddControl) return;
    const scope = controlScope.trim() || "#/properties/field";
    const suggestion = findControlScopeSuggestion(allSuggestions, scope);
    const element = createUiElement("Control", {
      translate: t,
      scope,
      label: suggestion?.label,
    });
    onRootChange(insertUiElement(root, insertParentPath, element));
    const next = listControlScopeSuggestions(document, {
      excludeScopes: [...usedScopes, scope],
    });
    setControlScope(next[0]?.scope ?? "");
    onDone();
  }

  return (
    <div className="jse-element-actions">
      <p className="jse-element-actions__target">
        {t("elementActions.target")} <strong>{targetLabel}</strong>
        <span className="jse-element-actions__kind">({targetElement.elementKind})</span>
      </p>

      {compatibleKinds.length > 0 ? (
        <div className="jse-element-actions__section">
          <span className="jse-structure-editor__hint">{t("elementActions.addUiElement")}</span>
          <div className="jse-structure-editor__buttons">
            {compatibleKinds.map((kind) => (
              <JseButton key={kind} type="button" onClick={() => addElement(kind)}>
                {t("elementActions.addKind", { kind })}
              </JseButton>
            ))}
          </div>
        </div>
      ) : null}

      {canAddControl ? (
        <div className="jse-element-actions__section">
          <ControlScopeField
            document={document}
            usedScopes={usedScopes}
            modelValue={controlScope}
            onModelValueChange={setControlScope}
          />
          <div className="jse-structure-editor__buttons">
            <JseButton type="button" onClick={addControl}>
              {t("elementActions.addKind", { kind: "Control" })}
            </JseButton>
          </div>
        </div>
      ) : null}

      {compatibleKinds.length === 0 && !canAddControl ? (
        <p className="jse-structure-editor__note">
          {t("uiStructure.toolbarNoCompatible", { label: targetLabel })}
        </p>
      ) : null}
    </div>
  );
}
