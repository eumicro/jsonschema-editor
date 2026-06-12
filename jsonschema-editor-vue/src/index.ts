import type { App } from "vue";
import "./style.css";
import "./registry/register-defaults.js";
import JsonSchemaForm from "./components/templates/JsonSchemaForm.vue";
import JsonSchemaFormEditor from "./components/templates/JsonSchemaFormEditor.vue";
import ControlField from "./components/molecules/form/ControlField.vue";
import UiElementRenderer from "./components/molecules/ui/UiElementRenderer.vue";

export { JsonSchemaForm, JsonSchemaFormEditor, ControlField, UiElementRenderer };

export {
  SchemaDocument,
  documentFromJSON,
  buildDefRef,
  parseDefRef,
} from "@jsonschema-editor/json-schema";

export * from "./composables/useScopedField";
export * from "./composables/useRegistries";
export * from "./composables/useEditorContext";
export * from "./registry/type-registry";
export * from "./registry/attribute-control-registry";
export * from "./registry/registries";
export * from "./registry/renderer-registry";
export { registerDefaultControls } from "./registry/register-defaults";

export function install(app: App): void {
  app.component("JsonSchemaForm", JsonSchemaForm);
  app.component("JsonSchemaFormEditor", JsonSchemaFormEditor);
  app.component("ControlField", ControlField);
  app.component("UiElementRenderer", UiElementRenderer);
}

export default { install };
