import "./style.css";

export { JsonSchemaForm } from "./components/templates/JsonSchemaForm.js";
export type { JsonSchemaFormHandle, JsonSchemaFormProps } from "./components/templates/JsonSchemaForm.js";
export { JsonSchemaFormEditor } from "./components/templates/JsonSchemaFormEditor.js";
export type { JsonSchemaFormEditorProps } from "./components/templates/JsonSchemaFormEditor.js";
export { ControlField } from "./components/molecules/form/ControlField.js";
export { UiElementRenderer } from "./components/molecules/ui/UiFormElementResolver.js";
export { JseInput } from "./components/atoms/JseInput.js";
export { JseSelect } from "./components/atoms/JseSelect.js";
export { JseSchemaFormField } from "./components/molecules/form/JseSchemaFormField.js";

export {
  SchemaDocument,
  documentFromJSON,
  buildDefRef,
  parseDefRef,
} from "@jsonschema-editor/json-schema";

export { useScopedField, useArrayFieldValue } from "./hooks/useScopedField.js";
export type { AttributeControlProps } from "./types/attribute-control-props.js";
export { useFormFieldLabel } from "./hooks/useFormFieldLabel.js";
export { useFormValidation, useFieldValidation } from "./context/FormValidationContext.js";
export { useSchemaFormTypeRegistry, useUiFormTypeRegistry } from "./context/RegistriesContext.js";
export {
  useSchemaEditorTypeRegistry,
  useUiEditorTypeRegistry,
  useSchemaAttributeControlRegistry,
  useUiAttributeControlRegistry,
  useJsonSchemaAttributeRegistry,
  useUiSchemaAttributeRegistry,
} from "./context/RegistriesContext.js";
export { useEditorContext } from "./context/EditorContext.js";
export type { EditorContextValue } from "./context/EditorContext.js";
export { useSchemaFormEditorState } from "./hooks/useSchemaFormEditorState.js";
export type { EditorTab } from "./hooks/useSchemaFormEditorState.js";
export { useSchemaAttributesPanel } from "./hooks/useSchemaAttributesPanel.js";
export { useUiAttributesPanel } from "./hooks/useUiAttributesPanel.js";
export { useFloatingPanel } from "./hooks/useFloatingPanel.js";
export { useTreeNodeActionLabels } from "./hooks/useTreeNodeActionLabels.js";
export { useJseI18n, resolveJseI18nOptions, JseI18nProvider } from "./context/JseI18nContext.js";
export * from "./i18n";
export * from "./registry/type-registry.js";
export * from "./registry/attribute-control-registry.js";
export * from "./registry/registries.js";
export * from "./registry/form-field-context.js";
export * from "./validation/schema-validator.js";
export * from "./registry/react-extension.js";
export * from "./registry/schema-type-extension-registry.js";
export { registerDefaultControls } from "./registry/register-defaults.js";
export type { FormFieldProps } from "./types/form-field-props.js";
