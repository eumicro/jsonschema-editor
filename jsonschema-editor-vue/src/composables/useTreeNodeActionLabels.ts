import { computed, type ComputedRef, type Ref } from "vue";
import { useJseI18n } from "./useJseI18n";

export function useTreeNodeActionLabels(
  label: Ref<string> | ComputedRef<string>,
  mode: "schema" | "ui" = "schema",
) {
  const { t } = useJseI18n();

  return {
    addLabel: computed(() => t("tree.actions.addTo", { label: label.value })),
    editLabel: computed(() =>
      mode === "schema"
        ? t("tree.actions.editAttributes", { label: label.value })
        : t("tree.actions.editElement", { label: label.value }),
    ),
    deleteLabel: computed(() => t("tree.actions.deleteElement", { label: label.value })),
  };
}
