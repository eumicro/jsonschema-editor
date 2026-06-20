import { useJseI18n } from "../../context/JseI18nContext.js";

export interface JseTreeToggleProps {
  expanded?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
}

export function JseTreeToggle({ expanded, hasChildren, onToggle }: JseTreeToggleProps) {
  const { t } = useJseI18n();

  if (!hasChildren) {
    return <span className="jse-tree-node__spacer" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className="jse-tree-node__toggle"
      aria-label={expanded ? t("tree.toggle.collapse") : t("tree.toggle.expand")}
      aria-expanded={hasChildren ? expanded : undefined}
      onClick={(event) => {
        event.stopPropagation();
        onToggle?.();
      }}
    >
      {expanded ? "▼" : "▶"}
    </button>
  );
}
