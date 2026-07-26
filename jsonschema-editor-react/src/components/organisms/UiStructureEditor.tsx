import { useCallback, useMemo, useRef, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import { UiTreeNode } from "../molecules/tree/UiTreeNode.js";
import { UiLayoutEditor } from "./UiLayoutEditor.js";
import { UiAttributesPanel } from "../molecules/panels/UiAttributesPanel.js";
import {
  JseFloatingPanel,
  type JseFloatingPanelHandle,
} from "../molecules/JseFloatingPanel.js";
import { UiElementActions } from "../molecules/UiElementActions.js";
import { UiAddToolbar } from "../molecules/UiAddToolbar.js";
import {
  controlPathOfDetail,
  ensureControlDetailLayout,
  getUiElementAt,
  getUiElementLabel,
  isLayoutElement,
  moveUiElement,
  moveUiElementTo,
  removeUiElement,
  uiPathKey,
  type UiPath,
} from "../../utils/ui-editor.js";
import { syncUiI18nPrefix } from "../../utils/sync-ui-i18n-prefix.js";
import { useJseI18n } from "../../context/JseI18nContext.js";
import type { JseLocale } from "../../i18n/types.js";
import type { UiLabelMessages } from "../../utils/ui-label-messages.js";

export interface UiStructureEditorProps {
  root: UiElement;
  selectedPath: UiPath;
  document?: SchemaDocument | null;
  onRootChange: (root: UiElement) => void;
  onSelectedPathChange: (path: UiPath) => void;
  labelLocales?: readonly JseLocale[];
  messages?: UiLabelMessages;
  onMessagesChange?: (messages: UiLabelMessages) => void;
}

export function UiStructureEditor({
  root,
  selectedPath,
  document,
  onRootChange,
  onSelectedPathChange,
  labelLocales,
  messages,
  onMessagesChange,
}: UiStructureEditorProps) {
  const { t } = useJseI18n();

  const [viewMode, setViewMode] = useState<"tree" | "layout">("layout");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set(["root"]));
  const [dragSourcePath, setDragSourcePath] = useState<UiPath | null>(null);
  const [paletteKind, setPaletteKind] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [attributesDialogOpen, setAttributesDialogOpen] = useState(false);
  const [addTargetPath, setAddTargetPath] = useState<UiPath>([]);
  const [attributesTargetPath, setAttributesTargetPath] = useState<UiPath>([]);
  const addPanelRef = useRef<JseFloatingPanelHandle>(null);
  const attributesPanelRef = useRef<JseFloatingPanelHandle>(null);

  const attributesPanelTitle = useMemo(() => {
    try {
      const element = getUiElementAt(root, attributesTargetPath);
      const label = getUiElementLabel(element);
      return t("uiStructure.attributesTitle", { label });
    } catch {
      return t("uiStructure.attributesFallback");
    }
  }, [attributesTargetPath, root, t]);

  const selectedLabel = useMemo(() => {
    try {
      const element = getUiElementAt(root, selectedPath);
      return getUiElementLabel(element);
    } catch {
      return t("uiStructure.noSelection");
    }
  }, [root, selectedPath, t]);

  const patchRoot = useCallback(
    (next: UiElement, path?: UiPath) => {
      onRootChange(next);
      if (path) onSelectedPathChange(path);
    },
    [onRootChange, onSelectedPathChange],
  );

  const togglePath = useCallback((path: UiPath) => {
    const key = uiPathKey(path);
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const expandPath = useCallback((path: UiPath) => {
    setExpandedKeys((current) => new Set([...current, uiPathKey(path)]));
  }, []);

  const anchorPanel = useCallback(
    (panelRef: React.RefObject<JseFloatingPanelHandle | null>, event: React.MouseEvent) => {
      window.requestAnimationFrame(() => {
        const target = event.currentTarget;
        const row =
          target instanceof HTMLElement
            ? (target.closest(".jse-tree-node__row") ??
              target.closest(".jse-layout-block__header"))
            : null;
        if (row instanceof HTMLElement) panelRef.current?.anchorNear(row);
      });
    },
    [],
  );

  const openAddDialog = useCallback(
    (path: UiPath, event: React.MouseEvent) => {
      setAttributesDialogOpen(false);
      setAddTargetPath(path);
      onSelectedPathChange(path);
      setAddDialogOpen(true);
      anchorPanel(addPanelRef, event);
    },
    [anchorPanel, onSelectedPathChange],
  );

  const openAttributesDialog = useCallback(
    (path: UiPath, event: React.MouseEvent) => {
      setAddDialogOpen(false);
      setAttributesTargetPath(path);
      onSelectedPathChange(path);
      if (labelLocales && labelLocales.length > 0) {
        const synced = syncUiI18nPrefix(root, path, document, messages);
        if (synced.changed) {
          onRootChange(synced.root);
          if (synced.messages && onMessagesChange) {
            onMessagesChange(synced.messages);
          }
        }
      }
      setAttributesDialogOpen(true);
      anchorPanel(attributesPanelRef, event);
    },
    [
      anchorPanel,
      document,
      labelLocales,
      messages,
      onMessagesChange,
      onRootChange,
      onSelectedPathChange,
      root,
    ],
  );

  const deleteAtPath = useCallback(
    (path: UiPath) => {
      if (path.length === 0) return;
      patchRoot(removeUiElement(root, path), []);
    },
    [patchRoot, root],
  );

  const onTreeDrop = useCallback(
    (targetPath: UiPath, sourcePath: UiPath) => {
      setDragSourcePath(null);
      if (uiPathKey(sourcePath) === uiPathKey(targetPath)) return;

      const sourceParent = sourcePath.slice(0, -1);
      const targetParent = targetPath.slice(0, -1);

      if (uiPathKey(sourceParent) === uiPathKey(targetParent)) {
        patchRoot(moveUiElement(root, sourcePath, targetPath));
        return;
      }

      if (targetPath[targetPath.length - 1] === "detail") {
        const withDetail = ensureControlDetailLayout(
          root,
          controlPathOfDetail(targetPath),
        );
        const detail = getUiElementAt(withDetail, targetPath);
        if (isLayoutElement(detail)) {
          patchRoot(
            moveUiElementTo(withDetail, sourcePath, targetPath, detail.elements.length),
            sourcePath,
          );
        }
        return;
      }

      const targetElement = getUiElementAt(root, targetPath);
      if (isLayoutElement(targetElement)) {
        patchRoot(
          moveUiElementTo(root, sourcePath, targetPath, targetElement.elements.length),
          sourcePath,
        );
        return;
      }

      patchRoot(
        moveUiElementTo(
          root,
          sourcePath,
          targetParent,
          Number(targetPath[targetPath.length - 1]),
        ),
        sourcePath,
      );
    },
    [patchRoot, root],
  );

  return (
    <div className="jse-structure-editor">
      <div
        className="jse-structure-editor__view-toggle"
        role="tablist"
        aria-label={t("uiStructure.viewToggleAria")}
      >
        <button
          type="button"
          role="tab"
          className={[
            "jse-structure-editor__view-tab",
            viewMode === "layout" ? "jse-structure-editor__view-tab--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-selected={viewMode === "layout"}
          onClick={() => setViewMode("layout")}
        >
          {t("uiStructure.viewLayout")}
        </button>
        <button
          type="button"
          role="tab"
          className={[
            "jse-structure-editor__view-tab",
            viewMode === "tree" ? "jse-structure-editor__view-tab--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-selected={viewMode === "tree"}
          onClick={() => setViewMode("tree")}
        >
          {t("uiStructure.viewTree")}
        </button>
      </div>

      <p className="jse-structure-editor__hint jse-structure-editor__hint--top">
        {viewMode === "layout" ? t("uiStructure.hintLayout") : t("uiStructure.hintTree")}
      </p>

      {viewMode === "layout" ? (
        <UiLayoutEditor
          root={root}
          selectedPath={selectedPath}
          document={document}
          paletteKind={paletteKind}
          onRootChange={patchRoot}
          onSelectedPathChange={onSelectedPathChange}
          onAdd={openAddDialog}
          onEdit={openAttributesDialog}
          onDelete={deleteAtPath}
          onPaletteDragEnd={() => setPaletteKind(null)}
        />
      ) : null}

      {viewMode === "layout" ? (
        <UiAddToolbar
          root={root}
          selectedPath={selectedPath}
          document={document}
          onPaletteDrag={setPaletteKind}
        />
      ) : null}

      {viewMode === "layout" ? null : (
        <div
          className="jse-structure-editor__tree"
          role="tree"
          aria-label={t("uiStructure.treeAria")}
          onDragEnd={() => setDragSourcePath(null)}
        >
          <UiTreeNode
            root={root}
            path={[]}
            selectedPath={selectedPath}
            expandedKeys={expandedKeys}
            dragSourcePath={dragSourcePath}
            document={document}
            onSelect={onSelectedPathChange}
            onToggle={togglePath}
            onAdd={openAddDialog}
            onEdit={openAttributesDialog}
            onDelete={deleteAtPath}
            onDragStart={setDragSourcePath}
            onDrop={onTreeDrop}
          />
        </div>
      )}

      <div className="jse-structure-editor__status" aria-live="polite">
        <span className="jse-structure-editor__status-label">{t("uiStructure.selected")}</span>
        <span className="jse-structure-editor__status-name">{selectedLabel}</span>
      </div>

      <JseFloatingPanel
        ref={addPanelRef}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title={t("uiStructure.addElement")}
      >
        <UiElementActions
          root={root}
          targetPath={addTargetPath}
          document={document}
          onRootChange={(next) => {
            patchRoot(next);
            expandPath(addTargetPath);
          }}
          onDone={() => setAddDialogOpen(false)}
        />
      </JseFloatingPanel>

      <JseFloatingPanel
        ref={attributesPanelRef}
        open={attributesDialogOpen}
        onOpenChange={setAttributesDialogOpen}
        title={attributesPanelTitle}
        initialWidth={380}
        initialHeight={360}
      >
        <UiAttributesPanel
          root={root}
          selectedPath={attributesTargetPath}
          document={document}
          onRootChange={patchRoot}
          labelLocales={labelLocales}
          messages={messages}
          onMessagesChange={onMessagesChange}
        />
      </JseFloatingPanel>
    </div>
  );
}
