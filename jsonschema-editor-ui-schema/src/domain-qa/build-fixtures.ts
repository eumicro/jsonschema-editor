import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { allDomainScenarios } from "./scenarios/index.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

for (const scenario of allDomainScenarios) {
  const dir = join(rootDir, scenario.domain, scenario.id);
  mkdirSync(dir, { recursive: true });

  writeFileSync(
    join(dir, "meta.json"),
    JSON.stringify(
      {
        id: scenario.id,
        domain: scenario.domain,
        label: scenario.label,
        description: scenario.description,
        sources: scenario.sources,
      },
      null,
      2,
    ),
  );
  writeFileSync(join(dir, "schema.json"), JSON.stringify(scenario.schema, null, 2));
  writeFileSync(join(dir, "ui.schema.json"), JSON.stringify(scenario.uiSchema, null, 2));
  writeFileSync(join(dir, "valid.json"), JSON.stringify(scenario.valid, null, 2));
  writeFileSync(join(dir, "invalid.json"), JSON.stringify(scenario.invalid, null, 2));
}

console.log(`Materialisiert ${allDomainScenarios.length} Domain-QA-Fixtures unter ${rootDir}`);
