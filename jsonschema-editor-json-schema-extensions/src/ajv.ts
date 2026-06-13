import type { Ajv } from "ajv";
import { getFormatExtension, jsonSchemaFormatExtensions } from "./registry.js";

export interface RegisterAjvFormatsOptions {
  /** Also register `email` and `uri` via ajv-formats (recommended). */
  useAjvFormats?: boolean;
}

/**
 * Registers custom `phone` format and optional built-in formats on an AJV instance.
 */
export async function registerAjvFormats(
  ajv: Ajv,
  options: RegisterAjvFormatsOptions = {},
): Promise<Ajv> {
  const { useAjvFormats = true } = options;

  if (useAjvFormats) {
    const addFormats = (await import("ajv-formats")).default;
    addFormats(ajv);
  }

  for (const extension of jsonSchemaFormatExtensions) {
    if (extension.id === "phone") {
      ajv.addFormat(extension.format, {
        type: "string",
        validate: extension.validate,
      });
    }
  }

  return ajv;
}

export function compileFormatValidator(ajv: Ajv, id: Parameters<typeof getFormatExtension>[0]) {
  const extension = getFormatExtension(id);
  const { $schema: _schema, ...schema } = extension.toSchemaFragment();
  return ajv.compile(schema);
}
