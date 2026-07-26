import { useMemo } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { VerticalLayout } from "@jsonschema-editor/ui-schema";
import {
  canAcceptUiChild,
  controlPathOfDetail,
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
  document?: SchemaDocument | null;
  onPaletteDrag: (kind: string | null) => void;
}

export function UiAddToolbar({ root, selectedPath, document, onPaletteDrag }: UiAddToolbarProps) {
  const { t } = useJseI18n();

  const insertParentPath = useMemo(
    () => getUiInsertParentPath(root, selectedPath, document),
    [root, selectedPath, document],
  );

  const insertParent = useMemo((): UiElement => {
    const path = insertParentPath;
    if (path[path.length - 1] === "detail") {
      try {
        return getUiElementAt(root, path);
      } catch {
        return new VerticalLayout();
      }
    }
    return getUiElementAt(root, path);
  }, [root, insertParentPath]);

  const targetLabel = useMemo(() => {
    const path = insertParentPath;
    if (path[path.length - 1] === "detail") {
      try {
        const control = getUiElementAt(root, controlPathOfDetail(path));
        return t("layout.detailTarget", { label: getUiElementLabel(control) });
      } catch {
        return t("layout.detailHint");
      }
    }
    return getUiElementLabel(insertParent);
  }, [insertParent, insertParentPath, root, t]);

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
