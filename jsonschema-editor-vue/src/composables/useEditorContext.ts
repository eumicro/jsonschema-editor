import { inject } from "vue";
import {
  EDITOR_CONTEXT_KEY,
  RENDERER_REGISTRY_KEY,
  globalRendererRegistry,
  type EditorContext,
  type RendererRegistry,
} from "../registry/renderer-registry.js";

export function useRendererRegistry(): RendererRegistry {
  return inject(RENDERER_REGISTRY_KEY, globalRendererRegistry);
}

export function useEditorContext(): EditorContext {
  const ctx = inject(EDITOR_CONTEXT_KEY);
  if (!ctx) {
    throw new Error("useEditorContext requires JsonSchemaFormEditor");
  }
  return ctx;
}

export {
  useSchemaFormTypeRegistry,
  useSchemaEditorTypeRegistry,
  useUiFormTypeRegistry,
  useUiEditorTypeRegistry,
  useSchemaAttributeControlRegistry,
  useUiAttributeControlRegistry,
  useJsonSchemaAttributeRegistry,
  useUiSchemaAttributeRegistry,
} from "./useRegistries.js";
