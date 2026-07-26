import { useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { VerticalLayout } from "@jsonschema-editor/ui-schema";
import {
  canAcceptUiChild,
  controlPathOfDetail,
  ensureControlDetailLayout,
  getUiElementAt,
  insertUiElement,
  moveUiElementTo,
  parseUiPathKey,
  uiPathKey,
  type UiPath,
} from "../../utils/ui-editor.js";
import {
  clearLayoutDragState,
  parsePaletteDragData,
  setActiveLayoutDragSourcePath,
} from "../../utils/ui-layout-drag.js";
import {
  createPaletteUiElement,
  type UiPaletteKind,
} from "../../utils/ui-palette.js";
import { useJseI18n } from "../../context/JseI18nContext.js";
import { UiLayoutEditorNode } from "../molecules/UiLayoutEditorNode.js";

export interface UiLayoutEditorProps {
  root: UiElement;
  selectedPath: UiPath;
  document?: SchemaDocument | null;
  paletteKind?: string | null;
  onRootChange: (root: UiElement, path?: UiPath) => void;
  onSelectedPathChange: (path: UiPath) => void;
  onAdd: (path: UiPath, event: React.MouseEvent) => void;
  onEdit: (path: UiPath, event: React.MouseEvent) => void;
  onDelete: (path: UiPath) => void;
  onPaletteDragEnd?: () => void;
}

export function UiLayoutEditor({
  root,
  selectedPath,
  document,
  paletteKind = null,
  onRootChange,
  onSelectedPathChange,
  onAdd,
  onEdit,
  onDelete,
  onPaletteDragEnd,
}: UiLayoutEditorProps) {
  const { t } = useJseI18n();
  const [dragSourcePath, setDragSourcePath] = useState<UiPath | null>(null);

  function patchRoot(next: UiElement, path?: UiPath) {
    onRootChange(next, path);
    if (path) onSelectedPathChange(path);
  }

  function onDragStart(path: UiPath) {
    setDragSourcePath(path);
    setActiveLayoutDragSourcePath(path, uiPathKey);
  }

  function onDragEnd() {
    window.setTimeout(() => {
      setDragSourcePath(null);
      clearLayoutDragState();
      onPaletteDragEnd?.();
    }, 0);
  }

  function resolvePaletteKind(event?: React.DragEvent): string | null {
    if (paletteKind) return paletteKind;
    return parsePaletteDragData(event?.dataTransfer?.getData("text/plain"));
  }

  function onDropAt(parentPath: UiPath, insertIndex: number, event?: React.DragEvent) {
    const kind = resolvePaletteKind(event);
    if (kind) {
      let workingRoot = root;
      let workingParentPath = parentPath;
      if (workingParentPath[workingParentPath.length - 1] === "detail") {
        workingRoot = ensureControlDetailLayout(
          workingRoot,
          controlPathOfDetail(workingParentPath),
        );
      }

      let parent;
      try {
        parent = getUiElementAt(workingRoot, workingParentPath);
      } catch {
        parent = new VerticalLayout();
      }

      const element = createPaletteUiElement(kind as UiPaletteKind, {
        root: workingRoot,
        document,
        translate: t,
        parentPath: workingParentPath,
      });
      if (!canAcceptUiChild(parent, element)) return;

      const next = insertUiElement(workingRoot, workingParentPath, element, insertIndex);
      setDragSourcePath(null);
      clearLayoutDragState();
      onPaletteDragEnd?.();
      patchRoot(next, [...workingParentPath, insertIndex]);
      return;
    }

    let sourcePath = dragSourcePath;
    if (!sourcePath && event?.dataTransfer) {
      const key = event.dataTransfer.getData("text/plain");
      if (key && !parsePaletteDragData(key)) sourcePath = parseUiPathKey(key);
    }
    if (!sourcePath) return;
    setDragSourcePath(null);
    clearLayoutDragState();
    patchRoot(moveUiElementTo(root, sourcePath, parentPath, insertIndex), sourcePath);
  }

  return (
    <div
      className={[
        "jse-layout-editor",
        dragSourcePath !== null || paletteKind ? "jse-layout-editor--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onDragEnd={onDragEnd}
    >
      <UiLayoutEditorNode
        root={root}
        path={[]}
        selectedPath={selectedPath}
        dragSourcePath={dragSourcePath}
        document={document}
        paletteKind={paletteKind}
        onSelect={onSelectedPathChange}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
        onDropAt={onDropAt}
      />
    </div>
  );
}
