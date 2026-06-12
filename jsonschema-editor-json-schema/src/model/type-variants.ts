import type { JsonSchemaObject, JsonSchemaType } from "../types.js";

/** Hält `type` als Einzelwert oder Array für spezifikationskonforme Roundtrips. */
export class TypeVariants {
  private variants: JsonSchemaType[] | undefined;

  applyFrom(json: JsonSchemaObject): void {
    if (json.type === undefined) {
      this.variants = undefined;
      return;
    }
    if (Array.isArray(json.type)) {
      this.variants = [...json.type];
      return;
    }
    this.variants = [json.type];
  }

  writeTo(json: JsonSchemaObject, fallback: JsonSchemaType): void {
    const types = this.variants ?? [fallback];
    json.type = types.length === 1 ? types[0] : types;
  }

  clone(): TypeVariants {
    const copy = new TypeVariants();
    copy.variants = this.variants ? [...this.variants] : undefined;
    return copy;
  }
}
