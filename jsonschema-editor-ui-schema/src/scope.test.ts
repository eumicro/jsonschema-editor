import { describe, expect, it } from "vitest";
import { buildArrayItemScope, buildPropertyScope, scopeToPath } from "./scope.js";

describe("scopeToPath", () => {
  it("parses property segments", () => {
    expect(scopeToPath("#/properties/name")).toEqual(["name"]);
    expect(scopeToPath("#/properties/person/properties/email")).toEqual(["person", "email"]);
  });

  it("parses array item segments", () => {
    expect(scopeToPath("#/properties/positionen/items/0/properties/betrag")).toEqual([
      "positionen",
      "0",
      "betrag",
    ]);
  });
});

describe("scope builders", () => {
  it("builds nested scopes", () => {
    expect(buildPropertyScope("#/properties/invoice", "positionen")).toBe(
      "#/properties/invoice/properties/positionen",
    );
    expect(buildArrayItemScope("#/properties/positionen", 2)).toBe(
      "#/properties/positionen/items/2",
    );
  });
});
