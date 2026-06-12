import { describe, expect, it } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { createAjv } from "@jsonforms/core";
import { allDomainScenarios, scenariosByDomain } from "./scenarios/index.js";
import { loadDomainFixturesFromDisk } from "./catalog.js";
import type { DomainId } from "./types.js";
import {
  assertFormDefinitionRoundtrip,
  assertSchemaRoundtrip,
  assertUiSchemaRoundtrip,
  assertUiScopesResolve,
} from "./test-helpers.js";

const ajv = addFormats(new Ajv({ allErrors: true, strict: false }));
const jsonFormsAjv = createAjv();

function compileValidator(schema: Record<string, unknown>) {
  const { $schema: _schema, ...validationSchema } = schema;
  return ajv.compile(validationSchema);
}

describe("Domain-QA: Szenario-Katalog", () => {
  it("enthält je Domäne genau 10 Szenarien", () => {
    const domains: DomainId[] = ["automotive", "medicine", "administration", "cms", "finance"];
    for (const domain of domains) {
      expect(scenariosByDomain[domain]).toHaveLength(10);
    }
    expect(allDomainScenarios).toHaveLength(50);
  });

  it("verwendet eindeutige Szenario-IDs", () => {
    const ids = allDomainScenarios.map((scenario) => `${scenario.domain}/${scenario.id}`);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("dokumentiert mindestens eine Internet-Quelle pro Szenario", () => {
    for (const scenario of allDomainScenarios) {
      expect(scenario.sources.length).toBeGreaterThan(0);
      for (const source of scenario.sources) {
        expect(source).toMatch(/^https?:\/\//);
      }
    }
  });
});

describe.each(allDomainScenarios)("$domain/$id – $label", (scenario) => {
  it("lädt Schema und UI-Schema über FormDefinition", () => {
    expect(() => assertFormDefinitionRoundtrip(scenario)).not.toThrow();
  });

  it("roundtrippt das JSON-Schema-Modell", () => {
    assertSchemaRoundtrip(scenario.schema);
  });

  it("roundtrippt das UI-Schema-Modell", () => {
    assertUiSchemaRoundtrip(scenario.schema, scenario.uiSchema);
  });

  it("löst alle UI-Control-Scopes im Schema auf", () => {
    expect(() => assertUiScopesResolve(scenario.schema, scenario.uiSchema)).not.toThrow();
  });

  it("validiert gültige Beispieldaten mit AJV (JsonForms-kompatibel)", () => {
    const validate = compileValidator(scenario.schema as Record<string, unknown>);
    const valid = validate(scenario.valid);
    if (!valid) {
      throw new Error(`Erwartete gültige Daten schlagen fehl: ${ajv.errorsText(validate.errors)}`);
    }
    expect(valid).toBe(true);
  });

  it("validiert gültige Beispieldaten mit JsonForms createAjv", () => {
    const { $schema: _schema, ...validationSchema } = scenario.schema;
    const validate = jsonFormsAjv.compile(validationSchema);
    expect(validate(scenario.valid)).toBe(true);
  });

  it("lehnt ungültige Beispieldaten ab", () => {
    const validate = compileValidator(scenario.schema as Record<string, unknown>);
    expect(validate(scenario.invalid)).toBe(false);
  });
});

describe("Domain-QA: materialisierte JSON-Fixtures", () => {
  const diskFixtures = loadDomainFixturesFromDisk();

  it("lädt 50 Fixture-Paare aus dem fixtures/-Verzeichnis", () => {
    expect(diskFixtures).toHaveLength(50);
  });

  it.each(diskFixtures.map((scenario) => [scenario.domain, scenario.id, scenario.label, scenario] as const))(
    "%s/%s – %s (JSON-Dateien)",
    (_domain, _id, _label, scenario) => {
      expect(() => assertFormDefinitionRoundtrip(scenario)).not.toThrow();
      const validate = compileValidator(scenario.schema as Record<string, unknown>);
      expect(validate(scenario.valid)).toBe(true);
      expect(validate(scenario.invalid)).toBe(false);
    },
  );
});
