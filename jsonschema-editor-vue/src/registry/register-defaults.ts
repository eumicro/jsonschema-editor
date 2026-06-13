import {
  ArraySchema,
  BooleanSchema,
  CompositionSchema,
  IntegerSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  globalJsonSchemaAttributeRegistry,
} from "@jsonschema-editor/json-schema";
import {
  Category,
  Categorization,
  Control,
  Group,
  HorizontalLayout,
  Label,
  Step,
  Stepper,
  VerticalLayout,
  globalUiSchemaAttributeRegistry,
} from "@jsonschema-editor/ui-schema";
import { inferValueType } from "./attribute-control-registry.js";
import {
  globalSchemaAttributeControlRegistry,
  globalSchemaEditorTypeRegistry,
  globalSchemaFormTypeRegistry,
  globalUiAttributeControlRegistry,
  globalUiEditorTypeRegistry,
  globalUiFormTypeRegistry,
} from "./registries.js";

import BooleanFormField from "../components/molecules/form/BooleanFormField.vue";
import DefaultFormField from "../components/molecules/form/DefaultFormField.vue";
import EnumFormField from "../components/molecules/form/EnumFormField.vue";
import NumberFormField from "../components/molecules/form/NumberFormField.vue";
import ObjectFormField from "../components/molecules/form/ObjectFormField.vue";
import ArrayFormField from "../components/molecules/form/ArrayFormField.vue";
import StringFormField from "../components/molecules/form/StringFormField.vue";

import BooleanAttributeControl from "../components/molecules/attributes/BooleanAttributeControl.vue";
import JsonAttributeControl from "../components/molecules/attributes/JsonAttributeControl.vue";
import NumberAttributeControl from "../components/molecules/attributes/NumberAttributeControl.vue";
import StringAttributeControl from "../components/molecules/attributes/StringAttributeControl.vue";

import ControlUiElement from "../components/molecules/ui/ControlUiElement.vue";
import GroupUiElement from "../components/molecules/ui/GroupUiElement.vue";
import LabelUiElement from "../components/molecules/ui/LabelUiElement.vue";
import LayoutUiElement from "../components/molecules/ui/LayoutUiElement.vue";
import CategorizationUiElement from "../components/molecules/ui/CategorizationUiElement.vue";
import CategoryUiElement from "../components/molecules/ui/CategoryUiElement.vue";
import StepperUiElement from "../components/molecules/ui/StepperUiElement.vue";
import StepUiElement from "../components/molecules/ui/StepUiElement.vue";

let defaultsRegistered = false;

export function registerDefaultControls(): void {
  if (defaultsRegistered) return;
  defaultsRegistered = true;

  registerSchemaFormTypes();
  registerUiFormTypes();
  registerSchemaAttributeControls();
  registerUiAttributeControls();
}

function registerSchemaFormTypes(): void {
  globalSchemaFormTypeRegistry
    .registerMatch(
      (schema) => !!schema.enumValues?.length,
      EnumFormField,
      20,
      "schema-form-enum",
    )
    .registerInstanceOf(ObjectSchema, ObjectFormField, { id: "schema-form-object", priority: 18 })
    .registerInstanceOf(ArraySchema, ArrayFormField, { id: "schema-form-array", priority: 18 })
    .registerKind("object", ObjectFormField, 18, "schema-form-object-kind")
    .registerKind("array", ArrayFormField, 18, "schema-form-array-kind")
    .registerInstanceOf(StringSchema, StringFormField, { id: "schema-form-string" })
    .registerInstanceOf(NumberSchema, NumberFormField, { id: "schema-form-number" })
    .registerInstanceOf(IntegerSchema, NumberFormField, { id: "schema-form-integer" })
    .registerInstanceOf(BooleanSchema, BooleanFormField, { id: "schema-form-boolean" })
    .registerKind("string", StringFormField, 0, "schema-form-kind-string")
    .registerKind("number", NumberFormField, 0, "schema-form-kind-number")
    .registerKind("integer", NumberFormField, 0, "schema-form-kind-integer")
    .registerKind("boolean", BooleanFormField, 0, "schema-form-kind-boolean")
    .setDefault(DefaultFormField);

  globalSchemaEditorTypeRegistry
    .registerInstanceOf(ObjectSchema, DefaultFormField, { id: "schema-editor-object" })
    .registerInstanceOf(ArraySchema, DefaultFormField, { id: "schema-editor-array" })
    .registerInstanceOf(CompositionSchema, DefaultFormField, {
      id: "schema-editor-composition",
    })
    .registerInstanceOf(StringSchema, StringFormField, { id: "schema-editor-string" })
    .registerInstanceOf(NumberSchema, NumberFormField, { id: "schema-editor-number" })
    .registerInstanceOf(IntegerSchema, NumberFormField, { id: "schema-editor-integer" })
    .registerInstanceOf(BooleanSchema, BooleanFormField, { id: "schema-editor-boolean" })
    .setDefault(DefaultFormField);
}

function registerUiFormTypes(): void {
  globalUiFormTypeRegistry
    .registerInstanceOf(Control, ControlUiElement, { id: "ui-form-control-class", priority: 10 })
    .registerInstanceOf(Group, GroupUiElement, { id: "ui-form-group-class", priority: 10 })
    .registerInstanceOf(VerticalLayout, LayoutUiElement, {
      id: "ui-form-vertical-class",
      priority: 10,
    })
    .registerInstanceOf(HorizontalLayout, LayoutUiElement, {
      id: "ui-form-horizontal-class",
      priority: 10,
    })
    .registerInstanceOf(Label, LabelUiElement, { id: "ui-form-label-class", priority: 10 })
    .registerInstanceOf(Categorization, CategorizationUiElement, {
      id: "ui-form-categorization-class",
      priority: 10,
    })
    .registerInstanceOf(Category, CategoryUiElement, { id: "ui-form-category-class", priority: 10 })
    .registerInstanceOf(Stepper, StepperUiElement, { id: "ui-form-stepper-class", priority: 10 })
    .registerInstanceOf(Step, StepUiElement, { id: "ui-form-step-class", priority: 10 })
    .registerElementKind("Control", ControlUiElement, 5, "ui-form-control-kind")
    .registerElementKind("Group", GroupUiElement, 5, "ui-form-group-kind")
    .registerElementKind("VerticalLayout", LayoutUiElement, 5, "ui-form-vertical-kind")
    .registerElementKind("HorizontalLayout", LayoutUiElement, 5, "ui-form-horizontal-kind")
    .registerElementKind("Label", LabelUiElement, 5, "ui-form-label-kind")
    .registerElementKind("Categorization", CategorizationUiElement, 5, "ui-form-categorization-kind")
    .registerElementKind("Category", CategoryUiElement, 5, "ui-form-category-kind")
    .registerElementKind("Stepper", StepperUiElement, 5, "ui-form-stepper-kind")
    .registerElementKind("Step", StepUiElement, 5, "ui-form-step-kind")
    .setDefault(ControlUiElement);

  globalUiEditorTypeRegistry
    .registerElementKind("Control", ControlUiElement, 10, "ui-editor-control")
    .registerElementKind("Group", GroupUiElement, 10, "ui-editor-group")
    .registerElementKind("VerticalLayout", LayoutUiElement, 10, "ui-editor-vertical")
    .registerElementKind("HorizontalLayout", LayoutUiElement, 10, "ui-editor-horizontal")
    .registerElementKind("Label", LabelUiElement, 10, "ui-editor-label")
    .registerElementKind("Categorization", CategorizationUiElement, 10, "ui-editor-categorization")
    .registerElementKind("Category", CategoryUiElement, 10, "ui-editor-category")
    .registerElementKind("Stepper", StepperUiElement, 10, "ui-editor-stepper")
    .registerElementKind("Step", StepUiElement, 10, "ui-editor-step")
    .setDefault(ControlUiElement);
}

function registerSchemaAttributeControls(): void {
  globalSchemaAttributeControlRegistry
    .registerNames(
      ["title", "description", "pattern", "format"],
      StringAttributeControl,
      10,
      "schema-attr-string",
    )
    .registerNames(
      ["minLength", "maxLength", "minimum", "maximum", "minItems", "maxItems"],
      NumberAttributeControl,
      10,
      "schema-attr-number",
    )
    .registerNames(["enum", "examples"], JsonAttributeControl, 10, "schema-attr-json")
    .registerMatch(
      (ctx) =>
        globalJsonSchemaAttributeRegistry.isRegistered(ctx.attributeName) &&
        inferValueType(ctx.value) === "number",
      NumberAttributeControl,
      8,
      "schema-custom-number",
    )
    .registerMatch(
      (ctx) =>
        globalJsonSchemaAttributeRegistry.isRegistered(ctx.attributeName) &&
        inferValueType(ctx.value) === "boolean",
      BooleanAttributeControl,
      8,
      "schema-custom-boolean",
    )
    .registerMatch(
      (ctx) =>
        globalJsonSchemaAttributeRegistry.isRegistered(ctx.attributeName) &&
        inferValueType(ctx.value) === "array",
      JsonAttributeControl,
      8,
      "schema-custom-array",
    )
    .registerMatch(
      (ctx) => globalJsonSchemaAttributeRegistry.isRegistered(ctx.attributeName),
      StringAttributeControl,
      1,
      "schema-custom-string",
    )
    .setDefault(StringAttributeControl);
}

function registerUiAttributeControls(): void {
  globalUiAttributeControlRegistry
    .registerNames(["scope", "label", "text"], StringAttributeControl, 10, "ui-attr-string")
    .registerMatch(
      (ctx) =>
        !!globalUiSchemaAttributeRegistry.get(ctx.attributeName) &&
        inferValueType(ctx.value) === "number",
      NumberAttributeControl,
      8,
      "ui-custom-number",
    )
    .registerMatch(
      (ctx) =>
        !!globalUiSchemaAttributeRegistry.get(ctx.attributeName) &&
        inferValueType(ctx.value) === "boolean",
      BooleanAttributeControl,
      8,
      "ui-custom-boolean",
    )
    .registerMatch(
      (ctx) =>
        !!globalUiSchemaAttributeRegistry.get(ctx.attributeName) &&
        inferValueType(ctx.value) === "array",
      JsonAttributeControl,
      8,
      "ui-custom-array",
    )
    .registerMatch(
      (ctx) => !!globalUiSchemaAttributeRegistry.get(ctx.attributeName),
      StringAttributeControl,
      1,
      "ui-custom-string",
    )
    .setDefault(StringAttributeControl);
}

registerDefaultControls();
