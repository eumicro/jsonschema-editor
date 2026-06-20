import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { SchemaTreeNode } from "../molecules/tree/SchemaTreeNode.js";
import { SchemaDefsTreeNode } from "../molecules/tree/SchemaDefsTreeNode.js";
import { SchemaAttributesPanel } from "../molecules/panels/SchemaAttributesPanel.js";
import {
  JseFloatingPanel,
  type JseFloatingPanelHandle,
} from "../molecules/JseFloatingPanel.js";
import { SchemaElementActions } from "../molecules/SchemaElementActions.js";
import {
  DEFS_SEGMENT,
  getDocumentKindLabel,
  getDocumentNodeLabel,
  isDefsContainerPath,
  isValidDocumentPath,
  removeNodeAtPath,
  tryGetNodeAtPath,
} from "../../utils/schema-document.js";
import { schemaPathKey, type SchemaPath } from "../../utils/schema-editor.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

export interface SchemaStructureEditorProps {
  document: SchemaDocument;
  selectedPath: SchemaPath;
  onDocumentChange: (document: SchemaDocument) => void;
  onSelectedPathChange: (path: SchemaPath) => void;
}

function pathsOverlap(deletedPath: SchemaPath, targetPath: SchemaPath): boolean {
  if (targetPath.length === 0) return false;
  if (deletedPath.length > targetPath.length) return false;
  return deletedPath.every((segment, index) => segment === targetPath[index]);
}

export function SchemaStructureEditor({
  document,
  selectedPath,
  onDocumentChange,
  onSelectedPathChange,
}: SchemaStructureEditorProps) {
  const { t } = useJseI18n();

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(["root", DEFS_SEGMENT]),
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [attributesDialogOpen, setAttributesDialogOpen] = useState(false);
  const [addTargetPath, setAddTargetPath] = useState<SchemaPath>([]);
  const [attributesTargetPath, setAttributesTargetPath] = useState<SchemaPath>([]);
  const addPanelRef = useRef<JseFloatingPanelHandle>(null);
  const attributesPanelRef = useRef<JseFloatingPanelHandle>(null);

  useEffect(() => {
    setExpandedKeys((current) => {
      const next = new Set(current);
      next.add("root");
      next.add(DEFS_SEGMENT);
      return next;
    });

    if (!isValidDocumentPath(document, attributesTargetPath)) {
      setAttributesDialogOpen(false);
      setAttributesTargetPath([]);
    }
    if (!isValidDocumentPath(document, addTargetPath)) {
      setAddDialogOpen(false);
      setAddTargetPath([]);
    }
    if (!isValidDocumentPath(document, selectedPath)) {
      onSelectedPathChange([]);
    }
  }, [addTargetPath, attributesTargetPath, document, onSelectedPathChange, selectedPath]);

  const selectedLabel = useMemo(() => {
    const node = tryGetNodeAtPath(document, selectedPath);
    if (!node) return t("schemaStructure.noSelection");
    return getDocumentNodeLabel(node, selectedPath);
  }, [document, selectedPath, t]);

  const selectedKind = useMemo(() => {
    const node = tryGetNodeAtPath(document, selectedPath);
    return node ? getDocumentKindLabel(node) : "";
  }, [document, selectedPath]);

  const attributesPanelTitle = useMemo(() => {
    const node = tryGetNodeAtPath(document, attributesTargetPath);
    if (!node) return t("schemaStructure.attributesFallback");
    const label = getDocumentNodeLabel(node, attributesTargetPath);
    return t("schemaStructure.attributesTitle", { label });
  }, [attributesTargetPath, document, t]);

  const patchDocument = useCallback(
    (next: SchemaDocument, newPath?: SchemaPath) => {
      onDocumentChange(next);
      if (newPath) onSelectedPathChange(newPath);
    },
    [onDocumentChange, onSelectedPathChange],
  );

  const togglePath = useCallback((path: SchemaPath) => {
    const key = schemaPathKey(path);
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const expandPath = useCallback((path: SchemaPath) => {
    setExpandedKeys((current) => new Set([...current, schemaPathKey(path)]));
  }, []);

  const anchorPanel = useCallback(
    (panelRef: React.RefObject<JseFloatingPanelHandle | null>, event: React.MouseEvent) => {
      window.requestAnimationFrame(() => {
        const target = event.currentTarget;
        const row =
          target instanceof HTMLElement ? target.closest(".jse-tree-node__row") : null;
        if (row instanceof HTMLElement) panelRef.current?.anchorNear(row);
      });
    },
    [],
  );

  const openAddDialog = useCallback(
    (path: SchemaPath, event: React.MouseEvent) => {
      setAttributesDialogOpen(false);
      setAddTargetPath(path);
      onSelectedPathChange(path);
      setAddDialogOpen(true);
      anchorPanel(addPanelRef, event);
    },
    [anchorPanel, onSelectedPathChange],
  );

  const openAttributesDialog = useCallback(
    (path: SchemaPath, event: React.MouseEvent) => {
      if (!isValidDocumentPath(document, path)) return;
      setAddDialogOpen(false);
      setAttributesTargetPath(path);
      onSelectedPathChange(path);
      setAttributesDialogOpen(true);
      anchorPanel(attributesPanelRef, event);
    },
    [anchorPanel, document, onSelectedPathChange],
  );

  const deleteAtPath = useCallback(
    (path: SchemaPath) => {
      if (path.length === 0 || isDefsContainerPath(path)) return;
      if (pathsOverlap(path, attributesTargetPath)) {
        setAttributesDialogOpen(false);
        setAttributesTargetPath([]);
      }
      if (pathsOverlap(path, addTargetPath)) {
        setAddDialogOpen(false);
        setAddTargetPath([]);
      }
      patchDocument(removeNodeAtPath(document, path), []);
    },
    [addTargetPath, attributesTargetPath, document, patchDocument],
  );

  return (
    <div className="jse-structure-editor">
      <p className="jse-structure-editor__hint jse-structure-editor__hint--top">
        {t("schemaStructure.hint")}
      </p>

      <div
        className="jse-structure-editor__tree"
        role="tree"
        aria-label={t("schemaStructure.treeAria")}
      >
        <SchemaTreeNode
          document={document}
          path={[]}
          selectedPath={selectedPath}
          expandedKeys={expandedKeys}
          onSelect={onSelectedPathChange}
          onToggle={togglePath}
          onAdd={openAddDialog}
          onEdit={openAttributesDialog}
          onDelete={deleteAtPath}
        />
        <SchemaDefsTreeNode
          document={document}
          selectedPath={selectedPath}
          expandedKeys={expandedKeys}
          onSelect={onSelectedPathChange}
          onToggle={togglePath}
          onAdd={openAddDialog}
          onEdit={openAttributesDialog}
          onDelete={deleteAtPath}
        />
      </div>

      <div className="jse-structure-editor__status" aria-live="polite">
        <span className="jse-structure-editor__status-label">
          {t("schemaStructure.selected")}
        </span>
        {selectedKind ? <span className="jse-tree-node__kind">{selectedKind}</span> : null}
        <span className="jse-structure-editor__status-name">{selectedLabel}</span>
      </div>

      <JseFloatingPanel
        ref={addPanelRef}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title={t("schemaStructure.addElement")}
      >
        <SchemaElementActions
          document={document}
          targetPath={addTargetPath}
          onDocumentChange={(next) => {
            patchDocument(next);
            expandPath(addTargetPath);
          }}
          onDone={() => setAddDialogOpen(false)}
          onItemsSet={(arrayPath) => {
            expandPath(arrayPath);
            expandPath([...arrayPath, "items"]);
          }}
        />
      </JseFloatingPanel>

      <JseFloatingPanel
        ref={attributesPanelRef}
        open={attributesDialogOpen}
        onOpenChange={setAttributesDialogOpen}
        title={attributesPanelTitle}
        initialWidth={360}
        initialHeight={420}
      >
        {isValidDocumentPath(document, attributesTargetPath) ? (
          <SchemaAttributesPanel
            document={document}
            selectedPath={attributesTargetPath}
            onDocumentChange={(next) => patchDocument(next)}
            onSelectedPathChange={(path) => {
              setAttributesTargetPath(path);
              onSelectedPathChange(path);
            }}
          />
        ) : null}
      </JseFloatingPanel>
    </div>
  );
}
