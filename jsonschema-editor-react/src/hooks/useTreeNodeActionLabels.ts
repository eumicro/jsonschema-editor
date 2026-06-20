import { useMemo } from "react";
import { useJseI18n } from "../context/JseI18nContext.js";

export function useTreeNodeActionLabels(label: string, mode: "schema" | "ui" = "schema") {
  const { t } = useJseI18n();

  return useMemo(
    () => ({
      addLabel: t("tree.actions.addTo", { label }),
      editLabel:
        mode === "schema"
          ? t("tree.actions.editAttributes", { label })
          : t("tree.actions.editElement", { label }),
      deleteLabel: t("tree.actions.deleteElement", { label }),
    }),
    [label, mode, t],
  );
}
