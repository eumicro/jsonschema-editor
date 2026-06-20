import { Fragment, useMemo, useState } from "react";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { Control, HorizontalLayout } from "@jsonschema-editor/ui-schema";
import {
  canMoveUiElementTo,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  listUiChildren,
  parseUiPathKey,
  uiPathKey,
  type UiPath,
} from "../../utils/ui-editor.js";
import { canAcceptUiChildren, canDeleteUiElement } from "../../utils/ui-tree-actions.js";
import {
  resolveStackInsertIndex,
  setActiveLayoutDragSourcePath,
  getActiveLayoutDragSourcePath,
} from "../../utils/ui-layout-drag.js";
import { useJseI18n } from "../../context/JseI18nContext.js";
import { useTreeNodeActionLabels } from "../../hooks/useTreeNodeActionLabels.js";
import { UiLayoutDropZone } from "../atoms/UiLayoutDropZone.js";
import { JseTreeNodeActions } from "./JseTreeNodeActions.js";

export interface UiLayoutEditorNodeProps {
  root: UiElement;
  path: UiPath;
  selectedPath: UiPath;
  dragSourcePath: UiPath | null;
  depth?: number;
  onSelect: (path: UiPath) => void;
  onAdd: (path: UiPath, event: React.MouseEvent) => void;
  onEdit: (path: UiPath, event: React.MouseEvent) => void;
  onDelete: (path: UiPath) => void;
  onDragStart: (path: UiPath) => void;
  onDropAt: (parentPath: UiPath, insertIndex: number, event?: React.DragEvent) => void;
}

export function UiLayoutEditorNode({
  root,
  path,
  selectedPath,
  dragSourcePath,
  depth = 0,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onDragStart,
  onDropAt,
}: UiLayoutEditorNodeProps) {
  const [activeDropIndex, setActiveDropIndex] = useState<number | null>(null);
  const { t } = useJseI18n();

  const element = getUiElementAt(root, path);
  const label = getUiElementLabel(element);
  const pathKey = uiPathKey(path);
  const isSelected = uiPathKey(selectedPath) === pathKey;
  const isLayout = isLayoutElement(element);
  const isHorizontal = element instanceof HorizontalLayout;
  const children = useMemo(
    () => (isLayout ? listUiChildren(element, path) : []),
    [element, isLayout, path],
  );
  const showAdd = canAcceptUiChildren(element);
  const showDelete = canDeleteUiElement(path);
  const { addLabel, editLabel, deleteLabel } = useTreeNodeActionLabels(label, "ui");
  const isDragging =
    dragSourcePath !== null && uiPathKey(dragSourcePath) === pathKey;

  const scopeHint = useMemo(() => {
    if (!(element instanceof Control)) return "";
    const segments = element.scope.split("/");
    return segments[segments.length - 1] ?? element.scope;
  }, [element]);

  const blockClass = useMemo(() => {
    const kind = element.elementKind;
    if (kind === "Control") return "jse-layout-block--control";
    if (kind === "Group") return "jse-layout-block--group";
    if (kind === "Label") return "jse-layout-block--label";
    if (kind === "HorizontalLayout") return "jse-layout-block--horizontal";
    if (kind === "VerticalLayout") return "jse-layout-block--vertical";
    if (kind === "Category" || kind === "Step") return "jse-layout-block--section";
    if (kind === "Categorization" || kind === "Stepper") return "jse-layout-block--container";
    return "jse-layout-block--default";
  }, [element.elementKind]);

  function resolveDragSourcePath(event?: React.DragEvent): UiPath | null {
    if (dragSourcePath) return dragSourcePath;
    const activePath = getActiveLayoutDragSourcePath(parseUiPathKey);
    if (activePath) return activePath;
    const key = event?.dataTransfer?.getData("text/plain");
    return key ? parseUiPathKey(key) : null;
  }

  function canDropAt(insertIndex: number, event?: React.DragEvent): boolean {
    const sourcePath = resolveDragSourcePath(event);
    if (!sourcePath) return false;
    return canMoveUiElementTo(root, sourcePath, path, insertIndex);
  }

  function handleDragStart(event: React.DragEvent) {
    onDragStart(path);
    setActiveLayoutDragSourcePath(path, uiPathKey);
    event.dataTransfer?.setData("text/plain", pathKey);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  }

  function onLayoutDragEnter(event: React.DragEvent) {
    if (!isLayout) return;
    if (!resolveDragSourcePath(event)) return;
    event.preventDefault();
  }

  function onLayoutDragOver(event: React.DragEvent) {
    if (!isLayout) return;
    event.stopPropagation();
    const stack = (event.currentTarget as HTMLElement).querySelector(
      ":scope > .jse-layout-editor__stack",
    );
    if (!(stack instanceof HTMLElement)) return;
    const insertIndex = resolveStackInsertIndex(stack, event.clientY);
    if (!canDropAt(insertIndex, event)) return;
    event.preventDefault();
    setActiveDropIndex(insertIndex);
  }

  function onLayoutDrop(event: React.DragEvent) {
    if (!isLayout) return;
    event.stopPropagation();
    const stack = (event.currentTarget as HTMLElement).querySelector(
      ":scope > .jse-layout-editor__stack",
    );
    if (!(stack instanceof HTMLElement)) return;
    event.preventDefault();
    const insertIndex = resolveStackInsertIndex(stack, event.clientY);
    setActiveDropIndex(null);
    if (!canDropAt(insertIndex, event)) return;
    onDropAt(path, insertIndex, event);
  }

  function onStackDragOver(event: React.DragEvent) {
    if (!isLayout) return;
    const stack = event.currentTarget;
    if (!(stack instanceof HTMLElement)) return;
    const insertIndex = resolveStackInsertIndex(stack, event.clientY);
    if (!canDropAt(insertIndex, event)) return;
    event.preventDefault();
    event.stopPropagation();
    setActiveDropIndex(insertIndex);
  }

  function onStackDrop(event: React.DragEvent) {
    if (!isLayout) return;
    const stack = event.currentTarget;
    if (!(stack instanceof HTMLElement)) return;
    event.preventDefault();
    event.stopPropagation();
    const insertIndex = resolveStackInsertIndex(stack, event.clientY);
    setActiveDropIndex(null);
    if (!canDropAt(insertIndex, event)) return;
    onDropAt(path, insertIndex, event);
  }

  function onDropZoneDragOver(insertIndex: number, event: React.DragEvent) {
    if (!canDropAt(insertIndex, event)) return;
    event.preventDefault();
    setActiveDropIndex(insertIndex);
  }

  function onDropZoneDrop(insertIndex: number, event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    setActiveDropIndex(null);
    if (!canDropAt(insertIndex, event)) return;
    onDropAt(path, insertIndex, event);
  }

  return (
    <article
      className={[
        "jse-layout-block",
        blockClass,
        isSelected ? "jse-layout-block--selected" : "",
        isDragging ? "jse-layout-block--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-ui-path={pathKey}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(path);
      }}
      onDragEnter={onLayoutDragEnter}
      onDragOver={onLayoutDragOver}
      onDrop={onLayoutDrop}
    >
      <header className="jse-layout-block__header">
        {path.length > 0 ? (
          <span
            className="jse-layout-block__drag-handle"
            draggable
            role="presentation"
            aria-hidden="true"
            onDragStart={(event) => {
              event.stopPropagation();
              handleDragStart(event);
            }}
            onDragEnd={() => setActiveDropIndex(null)}
          >
            ⠿
          </span>
        ) : null}
        <span className="jse-tree-node__kind">{element.elementKind}</span>
        <span className="jse-layout-block__title">{label}</span>
        {scopeHint ? <span className="jse-tree-node__meta">{scopeHint}</span> : null}
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
      </header>

      {isLayout ? (
        <div
          className={[
            "jse-layout-editor__stack",
            isHorizontal ? "jse-layout-editor__stack--horizontal" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onDragOver={onStackDragOver}
          onDragLeave={() => setActiveDropIndex(null)}
          onDrop={onStackDrop}
        >
          {children.map((childPath, index) => (
            <Fragment key={uiPathKey(childPath)}>
              <UiLayoutDropZone
                active={activeDropIndex === index && dragSourcePath !== null}
                onDragOver={(event) => onDropZoneDragOver(index, event)}
                onDragLeave={() => setActiveDropIndex(null)}
                onDrop={(event) => onDropZoneDrop(index, event)}
              />
              <UiLayoutEditorNode
                root={root}
                path={childPath}
                selectedPath={selectedPath}
                dragSourcePath={dragSourcePath}
                depth={depth + 1}
                onSelect={onSelect}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onDragStart={onDragStart}
                onDropAt={onDropAt}
              />
            </Fragment>
          ))}

          {children.length === 0 || dragSourcePath ? (
            <UiLayoutDropZone
              active={activeDropIndex === children.length && dragSourcePath !== null}
              label={children.length === 0 ? t("layout.dropElement") : undefined}
              onDragOver={(event) => onDropZoneDragOver(children.length, event)}
              onDragLeave={() => setActiveDropIndex(null)}
              onDrop={(event) => onDropZoneDrop(children.length, event)}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
