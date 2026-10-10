import { describe, expect, it } from "vitest";
import { cloneJsonCompatible } from "./clone-value.js";

describe("cloneJsonCompatible", () => {
  it("clones plain objects", () => {
    const source = { styleUrl: "https://example.test/{z}/{x}/{y}.png", point: true };
    const copy = cloneJsonCompatible(source);
    expect(copy).toEqual(source);
    expect(copy).not.toBe(source);
  });

  it("clones Vue-like Proxies without throwing", () => {
    const source = { styleUrl: "https://tiles.example/{z}/{x}/{y}.png", maxObjects: 3 };
    const proxied = new Proxy(source, {
      get(target, prop, receiver) {
        return Reflect.get(target, prop, receiver);
      },
    });
    expect(() => structuredClone(proxied)).toThrow();
    const copy = cloneJsonCompatible(proxied);
    expect(copy).toEqual(source);
    expect(copy).not.toBe(proxied);
  });
});
