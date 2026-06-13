import {
  BooleanSchema,
  IntegerSchema,
  NumberSchema,
  StringSchema,
} from "@jsonschema-editor/json-schema";
import {
  COMPUTED_ATTRIBUTE,
  createComputedNumberSchema,
  createComputedStringSchema,
  readComputedConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseVueExtension } from "@jsonschema-editor/vue";
import ComputedFormField from "./components/ComputedFormField.vue";

const SUM_EXPRESSION = "data.positionen.map(p, double(p.betrag)).sum()";

const STATUS_EXPRESSION = `!has(data.antragskopf.antragsdatum) || data.antragskopf.antragsdatum == '' ? 'NEU' :
  (!has(data.auftragsdaten.adresse) || data.auftragsdaten.adresse == '') ? 'ANTRAG_ANGELEGT' :
  (!has(data.durchfuehrung.datum) || data.durchfuehrung.datum == '') ? 'BEREIT_ZUR_DURCHFUEHRUNG' :
  (!data.abrechnung.beglichen) ? 'DURCHGEFUEHRT' : 'ERLEDIGT'`;

/** Field value derived from a CEL expression over root form data (`data`). */
export const computedExtension: JseVueExtension = {
  id: "jsonschema-editor-computed",
  formFields: [
    {
      id: "vue-ext-computed",
      priority: 35,
      match: matchCustomAttribute(COMPUTED_ATTRIBUTE),
      component: ComputedFormField,
    },
  ],
  schemaTypes: [
    {
      id: "computed-number",
      label: "computed-number",
      create: () =>
        createComputedNumberSchema(SUM_EXPRESSION, {
          title: "Gesamtsumme",
          description: "Summe aus Kostenpositionen (CEL).",
        }),
      match: (node) =>
        node instanceof NumberSchema && readComputedConfig(node) !== undefined,
    },
    {
      id: "computed-string",
      label: "computed-string",
      create: () =>
        createComputedStringSchema(STATUS_EXPRESSION, {
          title: "Status",
          description: "Workflow-Status aus Antragsdaten (CEL).",
        }),
      match: (node) =>
        node instanceof StringSchema && readComputedConfig(node) !== undefined,
    },
    {
      id: "computed-boolean",
      label: "computed-boolean",
      create: () => {
        const schema = new BooleanSchema();
        schema.title = "Computed flag";
        schema.setCustomAttribute(COMPUTED_ATTRIBUTE, {
          expression: "has(data.aktiv) && data.aktiv",
        });
        return schema;
      },
      match: (node) =>
        node instanceof BooleanSchema && readComputedConfig(node) !== undefined,
    },
    {
      id: "computed-integer",
      label: "computed-integer",
      create: () => {
        const schema = new IntegerSchema();
        schema.title = "Computed count";
        schema.setCustomAttribute(COMPUTED_ATTRIBUTE, {
          expression: "int(data.positionen.size())",
        });
        return schema;
      },
      match: (node) =>
        node instanceof IntegerSchema && readComputedConfig(node) !== undefined,
    },
  ],
};

export { ComputedFormField };
