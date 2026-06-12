/**
 * Prüft, dass alle JSON-Beispiele als SchemaDocument + UiSchema ladbar sind.
 */
import { documentFromJSON } from "@jsonschema-editor/json-schema";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dataRoot = join(dirname(fileURLToPath(import.meta.url)), "../src/examples/data");

for (const id of readdirSync(dataRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
  const dir = join(dataRoot, id);
  const schema = JSON.parse(readFileSync(join(dir, "schema.json"), "utf8"));
  const ui = JSON.parse(readFileSync(join(dir, "ui.schema.json"), "utf8"));
  documentFromJSON(schema);
  UiSchema.fromJSON(ui);
  console.log(`ok ${id}`);
}
