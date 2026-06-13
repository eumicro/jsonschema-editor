import type { App } from "vue";
import "./style.css";
import "./registry/register-defaults.js";
import JsonSchemaForm from "./components/templates/JsonSchemaForm.vue";
import JsonSchemaFormEditor from "./components/templates/JsonSchemaFormEditor.vue";
import ControlField from "./components/molecules/form/ControlField.vue";
import UiElementRenderer from "./components/molecules/ui/UiElementRenderer.vue";
import JseInput from "./components/atoms/JseInput.vue";
import JseSelect from "./components/atoms/JseSelect.vue";
import JseSchemaFormField from "./components/molecules/form/JseSchemaFormField.vue";

export { JsonSchemaForm, JsonSchemaFormEditor, ControlField, UiElementRenderer, JseInput, JseSelect, JseSchemaFormField };

export {
  SchemaDocument,
  documentFromJSON,
  buildDefRef,
  parseDefRef,
} from "@jsonschema-editor/json-schema";

export * from "./composables/useScopedField";
export * from "./composables/useFormFieldLabel";
export * from "./composables/useFormValidation";
export * from "./composables/useRegistries";
export * from "./composables/useEditorContext";
export * from "./composables/useSchemaFormEditorState";
export * from "./composables/useJseI18n";
export * from "./i18n";
export * from "./registry/type-registry";
export * from "./registry/attribute-control-registry";
export * from "./registry/registries";
export * from "./registry/renderer-registry";
export * from "./registry/form-field-context";
export * from "./validation/schema-validator";
export * from "./registry/vue-extension";
export * from "./registry/schema-type-extension-registry";
export { registerDefaultControls } from "./registry/register-defaults";
import { setupJseVueExtensions, type JseVueExtension } from "./registry/vue-extension.js";

export interface JseInstallOptions {
  extensions?: JseVueExtension[];
}

export function install(app: App, options?: JseInstallOptions): void {
  setupJseVueExtensions(options?.extensions);
  app.component("JsonSchemaForm", JsonSchemaForm);
  app.component("JsonSchemaFormEditor", JsonSchemaFormEditor);
  app.component("ControlField", ControlField);
  app.component("UiElementRenderer", UiElementRenderer);
}

export default { install };
