import type { JsonSchemaFormatExtension } from "../types.js";

/** Uses JSON Schema `uri` format (http/https and other URI schemes). */
export const URL_FORMAT = "uri";

export function validateUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const urlExtension: JsonSchemaFormatExtension = {
  id: "url",
  format: URL_FORMAT,
  title: "URL",
  description: "HTTP(S) URL validated via JSON Schema format uri and URL parser.",
  validate: validateUrl,
  toSchemaFragment() {
    return {
      type: "string",
      format: URL_FORMAT,
      title: this.title,
      description: this.description,
    };
  },
};
