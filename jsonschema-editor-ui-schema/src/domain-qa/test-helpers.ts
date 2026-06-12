import { deepStrictEqual } from "node:assert/strict";
import type { UiSchemaObject } from "../types.js";
import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";
import { schemaFromJSON } from "@jsonschema-editor/json-schema";
import { scopeToPath } from "../scope.js";
import { FormDefinition } from "../bridge/form-definition.js";
import type { DomainScenarioDefinition } from "./types.js";

export function collectControlScopes(uiSchema: UiSchemaObject): string[] {
  const scopes: string[] = [];

  function walk(node: unknown): void {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (record.type === "Control" && typeof record.scope === "string") {
      scopes.push(record.scope);
    }
    if (Array.isArray(record.elements)) {
      for (const child of record.elements) walk(child);
    }
  }

  walk(uiSchema);
  return scopes;
}

export function assertUiScopesResolve(schemaJson: JsonSchemaObject, uiSchema: UiSchemaObject): void {
  const form = FormDefinition.fromJSON(schemaJson, uiSchema);
  const scopes = collectControlScopes(uiSchema);

  for (const scope of scopes) {
    const node = form.schema.root.resolveAtScope(scope);
    if (!node) {
      throw new Error(`UI-Scope '${scope}' lässt sich nicht im JSON-Schema auflösen`);
    }
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  try {
    deepStrictEqual(actual, expected);
  } catch {
    throw new Error(message);
  }
}

export function assertSchemaRoundtrip(schemaJson: JsonSchemaObject): void {
  const form = FormDefinition.fromJSON(schemaJson);
  assertEqual(form.schema.toJSON(), schemaJson, "JSON-Schema-Roundtrip fehlgeschlagen");
}

export function assertUiSchemaRoundtrip(
  schemaJson: JsonSchemaObject,
  uiSchema: UiSchemaObject,
): void {
  const form = FormDefinition.fromJSON(schemaJson, uiSchema);
  assertEqual(form.uiSchema.toJSON(), uiSchema, "UI-Schema-Roundtrip fehlgeschlagen");
}

export function assertFormDefinitionRoundtrip(scenario: DomainScenarioDefinition): void {
  const form = FormDefinition.fromJSON(scenario.schema, scenario.uiSchema);
  assertEqual(form.toJSON().schema, scenario.schema, "FormDefinition Schema-Roundtrip fehlgeschlagen");
  assertEqual(form.toJSON().uiSchema, scenario.uiSchema, "FormDefinition UI-Roundtrip fehlgeschlagen");
}

export function resolveSchemaAtScope(schemaJson: JsonSchemaObject, scope: string) {
  return schemaFromJSON(schemaJson).resolveAtScope(scope);
}

export { scopeToPath };
