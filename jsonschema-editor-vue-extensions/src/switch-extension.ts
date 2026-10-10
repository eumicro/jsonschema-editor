import { BooleanSchema } from "@jsonschema-editor/json-schema";
import {
  createSwitchSchema,
  SWITCH_ATTRIBUTE,
  readSwitchConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseVueExtension } from "@jsonschema-editor/vue";
import SwitchFormField from "./components/SwitchFormField.vue";

/** Boolean field rendered as a toggle switch when `x-switch` is set. */
export const switchExtension: JseVueExtension = {
  id: "jsonschema-editor-switch",
  formFields: [
    {
      id: "vue-ext-switch",
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
          title: "Schalter",
        }),
      match: (node) => node instanceof BooleanSchema && readSwitchConfig(node) !== undefined,
    },
  ],
};

export { SwitchFormField };
