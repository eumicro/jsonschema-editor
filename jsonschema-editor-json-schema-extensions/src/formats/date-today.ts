import type { JsonSchemaFormatExtension } from "../types.js";

export const DATE_TODAY_FORMAT = "date-today";

export function todayIsoDate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * UX format only: never fails validation.
 * Today is applied once when a new value is first created in the form control.
 */
export function validateDateToday(_value: unknown): boolean {
  return true;
}

export const dateTodayExtension: JsonSchemaFormatExtension = {
  id: "date-today",
  format: DATE_TODAY_FORMAT,
  title: "Datum (heute)",
  description:
    "Date field that seeds today's date once when first created; no format/pattern validation.",
  validate: validateDateToday,
  toSchemaFragment() {
    return {
      type: "string",
      format: DATE_TODAY_FORMAT,
      title: this.title,
      description: this.description,
    };
  },
};
