import { JseIconButton } from "../atoms/JseIconButton.js";
import { useJseI18n } from "../../context/JseI18nContext.js";

export interface JseTreeNodeActionsProps {
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  addLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  onAdd?: (event: React.MouseEvent) => void;
  onEdit?: (event: React.MouseEvent) => void;
  onDelete?: () => void;
}

export function JseTreeNodeActions({
  showAdd,
  showEdit,
  showDelete,
  addLabel,
  editLabel,
  deleteLabel,
  onAdd,
  onEdit,
  onDelete,
}: JseTreeNodeActionsProps) {
  const { t } = useJseI18n();

  return (
    <div className="jse-tree-node__actions">
      {showAdd ? (
        <JseIconButton
          variant="primary"
          label={addLabel ?? t("tree.actions.add")}
          onClick={(event) => {
            event.stopPropagation();
            onAdd?.(event);
          }}
        >
          +
        </JseIconButton>
      ) : null}
      {showEdit ? (
        <JseIconButton
          label={editLabel ?? t("tree.actions.edit")}
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.(event);
          }}
        >
          <svg className="jse-icon-btn__svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M11.5 1.5a1.414 1.414 0 0 1 2 2L5.5 11.5 2 12l.5-3.5L11.5 1.5Zm1-1a2.414 2.414 0 0 0-3.414 0L1.086 9.5a.5.5 0 0 0-.121.196l-1 3.5A.5.5 0 0 0 .5 14a.5.5 0 0 0 .121-.01l3.5-1a.5.5 0 0 0 .196-.121l8-8A2.414 2.414 0 0 0 12.5.5Z"
            />
          </svg>
        </JseIconButton>
      ) : null}
      {showDelete ? (
        <JseIconButton
          variant="danger"
          label={deleteLabel ?? t("tree.actions.delete")}
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
        >
          <svg className="jse-icon-btn__svg" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M5.5 2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1h3.5a.5.5 0 0 1 0 1H12v9.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 12.5V3H2.5a.5.5 0 0 1 0-1H5.5Zm1 0h3v-.25a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25V2ZM5 3v9.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V3H5Zm2 2.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z"
            />
          </svg>
        </JseIconButton>
      ) : null}
    </div>
  );
}
