import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";
import type { UiSchemaObject } from "../types.js";

export type DomainId =
  | "automotive"
  | "medicine"
  | "administration"
  | "cms"
  | "finance";

export interface DomainScenarioDefinition {
  id: string;
  domain: DomainId;
  label: string;
  description: string;
  sources: string[];
  schema: JsonSchemaObject;
  uiSchema: UiSchemaObject;
  valid: Record<string, unknown>;
  invalid: Record<string, unknown>;
}

export interface DomainScenarioMeta {
  id: string;
  domain: DomainId;
  label: string;
  description: string;
  sources: string[];
}
