import { Environment } from "@marcbachmann/cel-js";

function sumList(list: unknown): number {
  if (!Array.isArray(list)) {
    return 0;
  }
  let total = 0;
  for (const entry of list) {
    total += Number(entry);
  }
  return total;
}

/** CEL environment with helpers missing from cel-js (e.g. list.sum). */
export function createComputedCelEnvironment(): Environment {
  const env = new Environment({ unlistedVariablesAreDyn: true });
  env.registerFunction("sum(list): double", sumList);
  env.registerFunction("list.sum(): double", sumList);
  return env;
}

let sharedEnvironment: Environment | undefined;

export function getComputedCelEnvironment(): Environment {
  if (!sharedEnvironment) {
    sharedEnvironment = createComputedCelEnvironment();
  }
  return sharedEnvironment;
}

export function normalizeComputedValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value && typeof value === "object" && "valueOf" in value) {
    const primitive = (value as { valueOf(): unknown }).valueOf();
    if (typeof primitive === "number" || typeof primitive === "bigint") {
      return Number(primitive);
    }
  }
  return value;
}

export type ComputedEvaluationResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

/** Evaluates a CEL expression against root form data (`data` binding). */
export function evaluateComputedExpression(
  expression: string,
  data: Record<string, unknown>,
): ComputedEvaluationResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { ok: false, error: "Empty CEL expression" };
  }

  try {
    const result = getComputedCelEnvironment().evaluate(trimmed, { data });
    return { ok: true, value: normalizeComputedValue(result) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message.split("\n")[0] : "CEL evaluation failed";
    return { ok: false, error: message };
  }
}
