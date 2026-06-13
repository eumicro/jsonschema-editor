export type { FormatExtensionId, JsonSchemaFormatExtension } from "./types.js";

export {
  emailExtension,
  validateEmail,
  EMAIL_PATTERN,
  urlExtension,
  validateUrl,
  URL_FORMAT,
  phoneExtension,
  validatePhone,
  PHONE_PATTERN,
  PHONE_FORMAT,
} from "./formats/index.js";

export {
  jsonSchemaFormatExtensions,
  getFormatExtension,
  getFormatExtensionByFormat,
  listFormatExtensionIds,
  applyFormatExtension,
  createStringSchemaWithFormat,
  createFormatSchemaFragment,
  validateFormatValue,
  validateByFormatKeyword,
  createExtensionsRegistry,
  defaultExtensionsRegistry,
  schemaFromJSONWithExtensions,
  documentFromJSONWithExtensions,
} from "./registry.js";

export {
  VALUES_SOURCE_ATTRIBUTE,
  createStaticValuesSourceSchema,
  createFetchValuesSourceSchema,
  readValuesSourceConfig,
  isStaticValuesSource,
  isFetchValuesSource,
  isValuesSourceConfig,
} from "./values-source.js";
export type {
  StaticValuesSource,
  FetchValuesSource,
  ValuesSourceConfig,
} from "./values-source.js";

export {
  registerAjvFormats,
  compileFormatValidator,
  type RegisterAjvFormatsOptions,
} from "./ajv.js";
