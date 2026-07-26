import { useMemo } from "react";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  canAcceptUiChild,
  createUiElement,
  getUiElementAt,
  getUiElementLabel,
  getUiInsertParentPath,
  type UiPath,
} from "../../utils/ui-editor.js";
import {
  encodePaletteDragData,
  setActivePaletteKind,
} from "../../utils/ui-layout-drag.js";
import { UI_PALETTE_KINDS, type UiPaletteKind } from "../../utils/ui-palette.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

export interface UiAddToolbarProps {
  root: UiElement;
  selectedPath: UiPath;
  onPaletteDrag: (kind: string | null) => void;
}

export function UiAddToolbar({ root, selectedPath, onPaletteDrag }: UiAddToolbarProps) {
  const { t } = useJseI18n();

  const insertParentPath = useMemo(
    () => getUiInsertParentPath(root, selectedPath),
    [root, selectedPath],
  );
  const insertParent = useMemo(
    () => getUiElementAt(root, insertParentPath),
    [root, insertParentPath],
  );
  const targetLabel = getUiElementLabel(insertParent);

  function isKindAllowed(kind: UiPaletteKind): boolean {
    return canAcceptUiChild(insertParent, createUiElement(kind, { translate: t }));
  }

  function onDragStart(kind: UiPaletteKind, event: React.DragEvent) {
    if (!isKindAllowed(kind)) {
      event.preventDefault();
      return;
    }
    setActivePaletteKind(kind);
    onPaletteDrag(kind);
    event.dataTransfer.setData("text/plain", encodePaletteDragData(kind));
    event.dataTransfer.effectAllowed = "copy";
  }

  function onDragEnd() {
    setActivePaletteKind(null);
    onPaletteDrag(null);
  }

  return (
    <div className="jse-structure-editor__toolbar" data-testid="ui-add-toolbar">
      <p className="jse-structure-editor__hint">
        {t("uiStructure.toolbarDragHint", { label: targetLabel })}
      </p>

      <div className="jse-structure-editor__buttons jse-structure-editor__buttons--palette">
        {UI_PALETTE_KINDS.map((kind) => {
          const allowed = isKindAllowed(kind);
          return (
            <button
              key={kind}
              type="button"
              className={["jse-palette-chip", allowed ? "" : "jse-palette-chip--disabled"]
                .filter(Boolean)
                .join(" ")}
              draggable={allowed}
              disabled={!allowed}
              aria-disabled={!allowed}
              title={
                allowed
                  ? t("uiStructure.paletteDragTitle", { kind })
                  : t("uiStructure.paletteDisabledTitle", { kind, label: targetLabel })
              }
              onDragStart={(event) => onDragStart(kind, event)}
              onDragEnd={onDragEnd}
            >
              {t("elementActions.addKind", { kind })}
            </button>
          );
        })}
      </div>
    </div>
  );
}
