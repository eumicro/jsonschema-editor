import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { resolveUiI18nString, type UiI18nSuffix } from "@jsonschema-editor/ui-schema";
import { useJseI18n } from "./useJseI18n";

/** Resolve JSON Forms–style UI label/text for layout elements. */
export function useUiElementDisplayLabel(
  i18n: MaybeRefOrGetter<string | undefined>,
  defaultMessage: MaybeRefOrGetter<string | undefined>,
  suffix: UiI18nSuffix,
  missingFallback?: MaybeRefOrGetter<string | undefined>,
) {
  const { t, te } = useJseI18n();

  return computed(() => {
    const resolved = resolveUiI18nString(
      {
        i18n: toValue(i18n),
        defaultMessage: toValue(defaultMessage),
        suffix,
      },
      (key) => (te(key) ? t(key) : undefined),
    );
    if (resolved) return resolved;
    return toValue(missingFallback);
  });
}
