import { describe, expect, it } from "vitest";
import {
  getValueAtPath,
  normalizeArrayValue,
  setValueAtPath,
} from "./data-instance.js";

describe("data-instance", () => {
  it("reads and writes nested array item properties", () => {
    const data = {
      positionen: [{ bezeichnung: "A", betrag: 10 }],
    };

    expect(getValueAtPath(data, ["positionen", "0", "betrag"])).toBe(10);

    const next = setValueAtPath(data, ["positionen", "0", "betrag"], 25);
    expect(next.positionen).toEqual([{ bezeichnung: "A", betrag: 25 }]);
  });

  it("creates array containers when setting a new index", () => {
    const data = { positionen: [] as unknown[] };
    const next = setValueAtPath(data, ["positionen", "0", "bezeichnung"], "Neu");
    expect(next.positionen).toEqual([{ bezeichnung: "Neu" }]);
  });

  it("writes nested array item properties at index 1", () => {
    let data = {
      positionen: [{ bezeichnung: "A", betrag: 10 }],
    };
    data = setValueAtPath(data, ["positionen"], [
      ...data.positionen,
      { bezeichnung: "", betrag: 0 },
    ]);
    data = setValueAtPath(data, ["positionen", "1", "bezeichnung"], "Zweite");
    expect(getValueAtPath(data, ["positionen", "1", "bezeichnung"])).toBe("Zweite");
  });

  it("normalizes invalid array values", () => {
    expect(normalizeArrayValue(undefined)).toEqual([]);
    expect(normalizeArrayValue(null)).toEqual([]);
    expect(normalizeArrayValue({})).toEqual([]);
    expect(normalizeArrayValue([1])).toEqual([1]);
  });
});
