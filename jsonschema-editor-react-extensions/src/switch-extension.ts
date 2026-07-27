import { BooleanSchema } from "@jsonschema-editor/json-schema";
import {
  createSwitchSchema,
  SWITCH_ATTRIBUTE,
  readSwitchConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseReactExtension } from "@jsonschema-editor/react";
import { SwitchFormField } from "./components/SwitchFormField.js";

/** Boolean field rendered as a toggle switch when `x-switch` is set. */
export const switchExtension: JseReactExtension = {
  id: "jsonschema-editor-switch",
  formFields: [
    {
      id: "react-ext-switch",
      priority: 30,
      match: matchCustomAttribute(SWITCH_ATTRIBUTE),
      component: SwitchFormField,
    },
  ],
  schemaTypes: [
    {
      id: "switch",
      label: "switch",
      matchPriority: 20,
      create: () =>
        createSwitchSchema({
          title: "Switch",
        }),
      match: (node) => node instanceof BooleanSchema && readSwitchConfig(node) !== undefined,
    },
  ],
};

export { SwitchFormField };
