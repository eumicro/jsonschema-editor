import { inject, provide, type InjectionKey } from "vue";
import type { RelationFieldProvider } from "@jsonschema-editor/json-schema-extensions";

export const RELATION_FIELD_PROVIDER_KEY: InjectionKey<RelationFieldProvider> = Symbol(
  "relationFieldProvider",
);

const emptyProvider: RelationFieldProvider = {
  async search() {
    return [];
  },
};

/** Provide entity search/open for relation form controls. */
export function provideRelationFieldProvider(provider: RelationFieldProvider): void {
  provide(RELATION_FIELD_PROVIDER_KEY, provider);
}

/** Resolve the active relation provider (injected or empty fallback). */
export function useRelationFieldProvider(): RelationFieldProvider {
  return inject(RELATION_FIELD_PROVIDER_KEY, emptyProvider);
}
