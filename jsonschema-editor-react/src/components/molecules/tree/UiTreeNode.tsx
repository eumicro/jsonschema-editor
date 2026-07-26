import { useMemo, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Control } from "@jsonschema-editor/ui-schema";
import {
  controlAllowsDetail,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  listUiChildren,
  uiPathKey,
  type UiPath,
} from "../../../utils/ui-editor.js";
import { canAcceptUiChildren, canDeleteUiElement } from "../../../utils/ui-tree-actions.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { useTreeNodeActionLabels } from "../../../hooks/useTreeNodeActionLabels.js";
import { JseTreeToggle } from "../../atoms/JseTreeToggle.js";
import { JseTreeNodeActions } from "../JseTreeNodeActions.js";

export interface UiTreeNodeProps {
  root: UiElement;
  path: UiPath;
  selectedPath: UiPath;
  expandedKeys: ReadonlySet<string>;
  depth?: number;
  dragSourcePath: UiPath | null;
  document?: SchemaDocument | null;
  onSelect: (path: UiPath) => void;
  onToggle: (path: UiPath) => void;
  onAdd: (path: UiPath, event: React.MouseEvent) => void;
  onEdit: (path: UiPath, event: React.MouseEvent) => void;
  onDelete: (path: UiPath) => void;
  onDragStart: (path: UiPath) => void;
  onDrop: (targetPath: UiPath, sourcePath: UiPath) => void;
}

export function UiTreeNode({
  root,
  path,
  selectedPath,
  expandedKeys,
  depth = 0,
  dragSourcePath,
  document,
  onSelect,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onDragStart,
  onDrop,
}: UiTreeNodeProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { t } = useJseI18n();

  const element = getUiElementAt(root, path);
  const children = useMemo(() => listUiChildren(element, path), [element, path]);
  const label = getUiElementLabel(element);
  const pathKey = uiPathKey(path);
  const isSelected = uiPathKey(selectedPath) === pathKey;
  const isExpanded = path.length === 0 || expandedKeys.has(pathKey);
  const isLayout = isLayoutElement(element);
  const hasDetail = controlAllowsDetail(element, document);
  const isContainer = isLayout || hasDetail;
  const showAdd = canAcceptUiChildren(element, document);
  const showDelete = canDeleteUiElement(path);
  const { addLabel, editLabel, deleteLabel } = useTreeNodeActionLabels(label, "ui");

  function handleDragStart(event: React.DragEvent) {
    onDragStart(path);
    event.dataTransfer?.setData("text/plain", pathKey);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event: React.DragEvent) {
    if (!isContainer || !dragSourcePath) return;
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragOver(false);
    if (!dragSourcePath) return;
    const targetPath =
      hasDetail && !isLayout ? ([...path, "detail"] as UiPath) : path;
    onDrop(targetPath, dragSourcePath);
  }

  return (
    <div className="jse-tree-node">
      <div
        className={[
          "jse-tree-node__row",
          isSelected ? "jse-tree-node__row--selected" : "",
          isDragOver ? "jse-tree-node__row--drag-over" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        draggable
        onClick={() => onSelect(path)}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <JseTreeToggle
          hasChildren={isContainer && children.length > 0}
          expanded={isExpanded}
          onToggle={() => onToggle(path)}
        />
        <span className="jse-tree-node__kind">{element.elementKind}</span>
        <span className="jse-tree-node__label">{label}</span>
        {element instanceof Control ? (
          <span className="jse-tree-node__meta">{element.scope}</span>
        ) : null}
        {hasDetail && !isLayout ? (
          <span className="jse-tree-node__meta">{t("layout.detailHint")}</span>
        ) : null}
        <JseTreeNodeActions
          showAdd={showAdd}
          showEdit
          showDelete={showDelete}
          addLabel={addLabel}
          editLabel={editLabel}
          deleteLabel={deleteLabel}
          onAdd={(event) => onAdd(path, event)}
          onEdit={(event) => onEdit(path, event)}
          onDelete={() => onDelete(path)}
        />
      </div>

      {isExpanded && children.length > 0 ? (
        <div className="jse-tree-node__children">
          {children.map((childPath) => (
            <UiTreeNode
              key={uiPathKey(childPath)}
              root={root}
              path={childPath}
              selectedPath={selectedPath}
              expandedKeys={expandedKeys}
              dragSourcePath={dragSourcePath}
              document={document}
              depth={depth + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDrop={onDrop}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
