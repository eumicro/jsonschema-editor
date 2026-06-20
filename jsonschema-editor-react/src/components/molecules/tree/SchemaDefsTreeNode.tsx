import { useMemo } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { DEFS_SEGMENT, listDocumentChildren } from "../../../utils/schema-document.js";
import { schemaPathKey, type SchemaPath } from "../../../utils/schema-editor.js";
import { JseTreeToggle } from "../../atoms/JseTreeToggle.js";
import { JseTreeNodeActions } from "../JseTreeNodeActions.js";
import { useJseI18n } from "../../../context/JseI18nContext.js";
import { SchemaTreeNode } from "./SchemaTreeNode.js";

export interface SchemaDefsTreeNodeProps {
  document: SchemaDocument;
  selectedPath: SchemaPath;
  expandedKeys: ReadonlySet<string>;
  onSelect: (path: SchemaPath) => void;
  onToggle: (path: SchemaPath) => void;
  onAdd: (path: SchemaPath, event: React.MouseEvent) => void;
  onEdit: (path: SchemaPath, event: React.MouseEvent) => void;
  onDelete: (path: SchemaPath) => void;
}

export function SchemaDefsTreeNode({
  document,
  selectedPath,
  expandedKeys,
  onSelect,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
}: SchemaDefsTreeNodeProps) {
  const { t } = useJseI18n();
  const defsPath = useMemo(() => [DEFS_SEGMENT] as SchemaPath, []);
  const defsChildren = useMemo(
    () => listDocumentChildren(document, defsPath),
    [document, defsPath],
  );
  const defsExpanded = expandedKeys.has(DEFS_SEGMENT);
  const defsSelected = schemaPathKey(selectedPath) === DEFS_SEGMENT;

  return (
    <div className="jse-tree-node">
      <div
        className={[
          "jse-tree-node__row",
          defsSelected ? "jse-tree-node__row--selected" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ paddingLeft: "4px" }}
        onClick={() => onSelect(defsPath)}
      >
        <JseTreeToggle hasChildren expanded={defsExpanded} onToggle={() => onToggle(defsPath)} />
        <span className="jse-tree-node__kind">$defs</span>
        <span className="jse-tree-node__label">{t("schemaStructure.defs.label")}</span>
        <JseTreeNodeActions
          showAdd
          showEdit={false}
          showDelete={false}
          addLabel={t("schemaStructure.defs.addDefinition")}
          onAdd={(event) => onAdd(defsPath, event)}
        />
      </div>

      {defsExpanded ? (
        <div className="jse-tree-node__children">
          {defsChildren.map((defPath) => (
            <SchemaTreeNode
              key={schemaPathKey(defPath)}
              document={document}
              path={defPath}
              selectedPath={selectedPath}
              expandedKeys={expandedKeys}
              depth={1}
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
