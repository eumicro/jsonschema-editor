import { useState } from "react";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { moveUiElementTo, parseUiPathKey, uiPathKey, type UiPath } from "../../utils/ui-editor.js";
import { setActiveLayoutDragSourcePath } from "../../utils/ui-layout-drag.js";
import { UiLayoutEditorNode } from "../molecules/UiLayoutEditorNode.js";

export interface UiLayoutEditorProps {
  root: UiElement;
  selectedPath: UiPath;
  onRootChange: (root: UiElement, path?: UiPath) => void;
  onSelectedPathChange: (path: UiPath) => void;
  onAdd: (path: UiPath, event: React.MouseEvent) => void;
  onEdit: (path: UiPath, event: React.MouseEvent) => void;
  onDelete: (path: UiPath) => void;
}

export function UiLayoutEditor({
  root,
  selectedPath,
  onRootChange,
  onSelectedPathChange,
  onAdd,
  onEdit,
  onDelete,
}: UiLayoutEditorProps) {
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
      setActiveLayoutDragSourcePath(null, uiPathKey);
    }, 0);
  }

  function onDropAt(parentPath: UiPath, insertIndex: number, event?: React.DragEvent) {
    let sourcePath = dragSourcePath;
    if (!sourcePath && event?.dataTransfer) {
      const key = event.dataTransfer.getData("text/plain");
      if (key) sourcePath = parseUiPathKey(key);
    }
    if (!sourcePath) return;
    setDragSourcePath(null);
    setActiveLayoutDragSourcePath(null, uiPathKey);
    patchRoot(moveUiElementTo(root, sourcePath, parentPath, insertIndex), sourcePath);
  }

  return (
    <div
      className={[
        "jse-layout-editor",
        dragSourcePath !== null ? "jse-layout-editor--dragging" : "",
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
