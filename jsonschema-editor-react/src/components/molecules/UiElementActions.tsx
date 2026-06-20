import { useMemo } from "react";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { JseButton } from "../atoms/JseButton.js";
import {
  createUiElement,
  getUiElementAt,
  getUiElementLabel,
  getUiInsertParentPath,
  insertUiElement,
  type UiPath,
} from "../../utils/ui-editor.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

export interface UiElementActionsProps {
  root: UiElement;
  targetPath: UiPath;
  onRootChange: (root: UiElement) => void;
  onDone: () => void;
}

type UiElementKind =
  | "Control"
  | "Group"
  | "VerticalLayout"
  | "HorizontalLayout"
  | "Label"
  | "Categorization"
  | "Category"
  | "Stepper"
  | "Step";

const uiElementKinds: UiElementKind[] = [
  "Control",
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
  onRootChange,
  onDone,
}: UiElementActionsProps) {
  const { t } = useJseI18n();

  const targetElement = useMemo(() => getUiElementAt(root, targetPath), [root, targetPath]);
  const targetLabel = getUiElementLabel(targetElement);
  const insertParentPath = useMemo(
    () => getUiInsertParentPath(root, targetPath),
    [root, targetPath],
  );

  function addElement(kind: UiElementKind) {
    const element = createUiElement(kind, { translate: t });
    onRootChange(insertUiElement(root, insertParentPath, element));
    onDone();
  }

  return (
    <div className="jse-element-actions">
      <p className="jse-element-actions__target">
        {t("elementActions.target")} <strong>{targetLabel}</strong>
        <span className="jse-element-actions__kind">({targetElement.elementKind})</span>
      </p>

      <div className="jse-element-actions__section">
        <span className="jse-structure-editor__hint">{t("elementActions.addUiElement")}</span>
        <div className="jse-structure-editor__buttons">
          {uiElementKinds.map((kind) => (
            <JseButton key={kind} type="button" onClick={() => addElement(kind)}>
              {t("elementActions.addKind", { kind })}
            </JseButton>
          ))}
        </div>
      </div>
    </div>
  );
}
