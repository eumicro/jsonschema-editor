import { administrationScenarios } from "./administration.js";
import { automotiveScenarios } from "./automotive.js";
import { cmsScenarios } from "./cms.js";
import { financeScenarios } from "./finance.js";
import { medicineScenarios } from "./medicine.js";
import type { DomainId, DomainScenarioDefinition } from "../types.js";

export const allDomainScenarios: DomainScenarioDefinition[] = [
  ...automotiveScenarios,
  ...medicineScenarios,
  ...administrationScenarios,
  ...cmsScenarios,
  ...financeScenarios,
];

export const scenariosByDomain: Record<DomainId, DomainScenarioDefinition[]> = {
  automotive: automotiveScenarios,
  medicine: medicineScenarios,
  administration: administrationScenarios,
  cms: cmsScenarios,
  finance: financeScenarios,
};

export function getScenario(domain: DomainId, id: string): DomainScenarioDefinition | undefined {
  return scenariosByDomain[domain]?.find((scenario) => scenario.id === id);
}
