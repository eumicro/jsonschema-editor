import { describe, expect, it } from "vitest";
import { documentFromJSONWithExtensions, syncComputedFormData } from "./index.js";

describe("syncComputedFormData", () => {
  it("writes CEL results into standard JSON Schema properties", () => {
    const doc = documentFromJSONWithExtensions({
      type: "object",
      properties: {
        a: { type: "number" },
        b: { type: "number" },
        total: {
          type: "number",
          "x-computed": { expression: "double(data.a) + double(data.b)" },
        },
      },
    });

    const next = syncComputedFormData(doc.root, { a: 2, b: 3 });
    expect(next).toEqual({ a: 2, b: 3, total: 5 });
  });

  it("returns the same reference when values are already current", () => {
    const doc = documentFromJSONWithExtensions({
      type: "object",
      properties: {
        total: {
          type: "number",
          "x-computed": { expression: "double(data.a) + double(data.b)" },
        },
      },
    });

    const data = { a: 1, b: 2, total: 3 };
    expect(syncComputedFormData(doc.root, data)).toBe(data);
  });

  it("keeps presentation orthogonal: progress-bar annotation does not affect sync", () => {
    const doc = documentFromJSONWithExtensions({
      type: "object",
      properties: {
        kontakte: {
          type: "array",
          items: {
            type: "object",
            properties: {
              zufriedenheit: { type: "number" },
            },
          },
        },
        progress: {
          type: "number",
          minimum: 0,
          maximum: 10,
          "x-progress-bar": { step: 0.1 },
          "x-computed": {
            expression:
              "!has(data.kontakte) || data.kontakte.size() == 0 ? 0.0 : data.kontakte.map(k, double(k.zufriedenheit)).sum() / double(data.kontakte.size())",
          },
        },
      },
    });

    const next = syncComputedFormData(doc.root, {
      kontakte: [{ zufriedenheit: 8 }, { zufriedenheit: 4 }],
    });
    expect(next.progress).toBe(6);
  });
});
