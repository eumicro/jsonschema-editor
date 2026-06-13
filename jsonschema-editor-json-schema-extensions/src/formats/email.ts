import type { JsonSchemaFormatExtension } from "../types.js";

/** Practical subset for email local@domain validation (not full RFC 5322). */
export const EMAIL_PATTERN =
  "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";

export function validateEmail(value: unknown): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  return new RegExp(EMAIL_PATTERN).test(value);
}

export const emailExtension: JsonSchemaFormatExtension = {
  id: "email",
  format: "email",
  title: "E-Mail",
  description: "String with JSON Schema format email and practical pattern validation.",
  pattern: EMAIL_PATTERN,
  validate: validateEmail,
  toSchemaFragment() {
    return {
      type: "string",
      format: "email",
      pattern: EMAIL_PATTERN,
      title: this.title,
      description: this.description,
    };
  },
};
