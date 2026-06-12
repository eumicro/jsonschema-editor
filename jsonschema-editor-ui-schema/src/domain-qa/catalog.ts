import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";
import type { UiSchemaObject } from "../types.js";
import type { DomainId, DomainScenarioDefinition, DomainScenarioMeta } from "./types.js";

const fixturesRoot = join(fileURLToPath(new URL(".", import.meta.url)), "fixtures");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadDomainFixturesFromDisk(): DomainScenarioDefinition[] {
  const scenarios: DomainScenarioDefinition[] = [];
  const domains = readdirSync(fixturesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());

  for (const domainEntry of domains) {
    const domain = domainEntry.name as DomainId;
    const scenarioDirs = readdirSync(join(fixturesRoot, domain), { withFileTypes: true }).filter((entry) =>
      entry.isDirectory(),
    );

    for (const scenarioEntry of scenarioDirs) {
      const base = join(fixturesRoot, domain, scenarioEntry.name);
      const meta = readJson<DomainScenarioMeta>(join(base, "meta.json"));
      scenarios.push({
        ...meta,
        schema: readJson<JsonSchemaObject>(join(base, "schema.json")),
        uiSchema: readJson<UiSchemaObject>(join(base, "ui.schema.json")),
        valid: readJson<Record<string, unknown>>(join(base, "valid.json")),
        invalid: readJson<Record<string, unknown>>(join(base, "invalid.json")),
      });
    }
  }

  return scenarios.sort((a, b) => `${a.domain}/${a.id}`.localeCompare(`${b.domain}/${b.id}`));
}

export { fixturesRoot };
