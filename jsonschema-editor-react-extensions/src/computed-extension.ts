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
  syncComputedFormData,
} from "@jsonschema-editor/json-schema-extensions";
import type { JseReactExtension } from "@jsonschema-editor/react";
import { ComputedFormField } from "./components/ComputedFormField.js";

const SUM_EXPRESSION = "data.positionen.map(p, double(p.betrag)).sum()";

const STATUS_EXPRESSION = `!has(data.antragskopf.antragsdatum) || data.antragskopf.antragsdatum == '' ? 'NEU' :
  (!has(data.auftragsdaten.adresse) || data.auftragsdaten.adresse == '') ? 'ANTRAG_ANGELEGT' :
  (!has(data.durchfuehrung.datum) || data.durchfuehrung.datum == '') ? 'BEREIT_ZUR_DURCHFUEHRUNG' :
  (!data.abrechnung.beglichen) ? 'DURCHGEFUEHRT' : 'ERLEDIGT'`;

/**
 * `x-computed` derives instance data via CEL.
 * Presentation stays with normal form-field matchers (type / format / other x-*).
 */
export const computedExtension: JseReactExtension = {
  id: "jsonschema-editor-computed",
  formDataSync: [
    {
      id: "react-computed-sync",
      sync: (schema, data) => syncComputedFormData(schema.root, data),
    },
  ],
  schemaTypes: [
    {
      id: "computed-number",
      label: "computed-number",
      matchPriority: 10,
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
      matchPriority: 10,
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
      matchPriority: 10,
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
      matchPriority: 10,
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

/** @deprecated Prefer formDataSync + normal field matchers; kept for optional direct use. */
export { ComputedFormField };
