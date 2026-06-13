import type { JsonSchemaFormatExtension } from "../types.js";

/**
 * International phone numbers (E.164-oriented).
 * Accepts optional leading +, country code, 7–15 digits total.
 */
export const PHONE_PATTERN = "^\\+?[1-9]\\d{6,14}$";

export const PHONE_FORMAT = "phone";

export function validatePhone(value: unknown): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  const normalized = value.replace(/[\s\-()./]/g, "");
  return new RegExp(PHONE_PATTERN).test(normalized);
}

export const phoneExtension: JsonSchemaFormatExtension = {
  id: "phone",
  format: PHONE_FORMAT,
  title: "Telefon",
  description: "International phone number (custom format phone, E.164-oriented pattern).",
  pattern: PHONE_PATTERN,
  validate: validatePhone,
  toSchemaFragment() {
    return {
      type: "string",
      format: PHONE_FORMAT,
      pattern: PHONE_PATTERN,
      title: this.title,
      description: this.description,
    };
  },
};
