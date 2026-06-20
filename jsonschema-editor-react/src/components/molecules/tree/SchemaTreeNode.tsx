import { useMemo } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { canAcceptSchemaChildren } from "../../../utils/schema-tree-actions.js";
import {
  canDeleteDocumentNode,
  getDocumentKindLabel,
  getDocumentNodeLabel,
  tryGetNodeAtPath,
  listDocumentChildren,
} from "../../../utils/schema-document.js";
import { schemaPathKey, type SchemaPath } from "../../../utils/schema-editor.js";
import { useTreeNodeActionLabels } from "../../../hooks/useTreeNodeActionLabels.js";
import { JseTreeToggle } from "../../atoms/JseTreeToggle.js";
import { JseTreeNodeActions } from "../JseTreeNodeActions.js";

export interface SchemaTreeNodeProps {
  document: SchemaDocument;
  path: SchemaPath;
  selectedPath: SchemaPath;
  expandedKeys: ReadonlySet<string>;
  depth?: number;
  onSelect: (path: SchemaPath) => void;
  onToggle: (path: SchemaPath) => void;
  onAdd: (path: SchemaPath, event: React.MouseEvent) => void;
  onEdit: (path: SchemaPath, event: React.MouseEvent) => void;
  onDelete: (path: SchemaPath) => void;
}

export function SchemaTreeNode({
  document,
  path,
  selectedPath,
  expandedKeys,
  depth = 0,
  onSelect,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: SchemaTreeNodeProps) {
  const node = tryGetNodeAtPath(document, path);
  const children = useMemo(
    () => listDocumentChildren(document, path),
    [document, path],
  );

  const label = node ? getDocumentNodeLabel(node, path) : path.join(".");
  const kindLabel = node ? getDocumentKindLabel(node) : "";
  const pathKey = schemaPathKey(path);
  const isSelected = schemaPathKey(selectedPath) === pathKey;
  const isExpanded = path.length === 0 || expandedKeys.has(pathKey);
  const hasChildren = children.length > 0;
  const showAdd = node !== undefined && canAcceptSchemaChildren(node);
  const showDelete = canDeleteDocumentNode(path);
  const { addLabel, editLabel, deleteLabel } = useTreeNodeActionLabels(label, "schema");

  if (!node) return null;

  return (
    <div className="jse-tree-node">
      <div
        className={[
          "jse-tree-node__row",
          isSelected ? "jse-tree-node__row--selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => onSelect(path)}
      >
        <JseTreeToggle
          hasChildren={hasChildren}
          expanded={isExpanded}
          onToggle={() => onToggle(path)}
        />
        <span className="jse-tree-node__kind">{kindLabel}</span>
        <span className="jse-tree-node__label">{label}</span>
        {node.title && node.title !== label ? (
          <span className="jse-tree-node__title">{node.title}</span>
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

      {isExpanded && hasChildren ? (
        <div className="jse-tree-node__children">
          {children.map((childPath) => (
            <SchemaTreeNode
              key={schemaPathKey(childPath)}
              document={document}
              path={childPath}
              selectedPath={selectedPath}
              expandedKeys={expandedKeys}
              depth={depth + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
