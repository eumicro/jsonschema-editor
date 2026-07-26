import { describe, expect, it } from "vitest";
import { NumberSchema } from "./model/numeric-schema.js";
import { JsonSchemaAttributeRegistry } from "./attribute-registry.js";
import { transferCompatibleCustomAttributes } from "./attribute-composition.js";

function createComposableRegistry(): JsonSchemaAttributeRegistry {
  const registry = new JsonSchemaAttributeRegistry();
  registry.register({
    name: "x-read-only",
    scope: "field",
    deserialize: (raw) => raw === true,
    serialize: (value) => value,
  });
  registry.register({
    name: "x-computed",
    offerForKinds: ["number", "integer", "string", "boolean"],
    composition: { role: "behavior" },
    deserialize: (raw) => raw,
    serialize: (value) => value,
  });
  registry.register({
    name: "x-progress-bar",
    offerForKinds: ["number", "integer"],
    composition: {
      role: "presentation",
      combinesWith: ["x-computed"],
      exclusiveWith: ["x-rating"],
    },
    deserialize: (raw) => raw,
    serialize: (value) => value,
  });
  registry.register({
    name: "x-rating",
    offerForKinds: ["number", "integer"],
    composition: {
      role: "presentation",
      combinesWith: ["x-computed"],
      exclusiveWith: ["x-progress-bar"],
    },
    deserialize: (raw) => raw,
    serialize: (value) => value,
  });
  return registry;
}

describe("transferCompatibleCustomAttributes", () => {
  it("keeps x-computed when switching to progress-bar and preserves expression", () => {
    const registry = createComposableRegistry();
    const from = new NumberSchema(registry);
    from.setCustomAttribute("x-computed", { expression: "data.a" });
    from.setCustomAttribute("x-read-only", true);

    const to = new NumberSchema(registry);
    to.setCustomAttribute("x-progress-bar", { step: 0.1 });

    transferCompatibleCustomAttributes(from, to, registry, { preserveOffered: true });

    expect(to.getCustomAttribute("x-progress-bar")).toEqual({ step: 0.1 });
    expect(to.getCustomAttribute("x-computed")).toEqual({ expression: "data.a" });
    expect(to.getCustomAttribute("x-read-only")).toBe(true);
  });

  it("drops exclusive presentation peers in favor of create() attribute", () => {
    const registry = createComposableRegistry();
    const from = new NumberSchema(registry);
    from.setCustomAttribute("x-progress-bar", { step: 0.2 });
    from.setCustomAttribute("x-computed", { expression: "1" });

    const to = new NumberSchema(registry);
    to.setCustomAttribute("x-rating", { step: 1 });

    transferCompatibleCustomAttributes(from, to, registry, { preserveOffered: true });

    expect(to.getCustomAttribute("x-rating")).toEqual({ step: 1 });
    expect(to.getCustomAttribute("x-progress-bar")).toBeUndefined();
    expect(to.getCustomAttribute("x-computed")).toEqual({ expression: "1" });
  });

  it("does not keep offered extension attrs when switching to a base kind", () => {
    const registry = createComposableRegistry();
    const from = new NumberSchema(registry);
    from.setCustomAttribute("x-computed", { expression: "1" });
    from.setCustomAttribute("x-progress-bar", { step: 0.1 });
    from.setCustomAttribute("x-read-only", true);

    const to = new NumberSchema(registry);

    transferCompatibleCustomAttributes(from, to, registry, { preserveOffered: false });

    expect(to.getCustomAttribute("x-computed")).toBeUndefined();
    expect(to.getCustomAttribute("x-progress-bar")).toBeUndefined();
    expect(to.getCustomAttribute("x-read-only")).toBe(true);
  });
});
