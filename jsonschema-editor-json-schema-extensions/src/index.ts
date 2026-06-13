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
  GEOMETRY_ATTRIBUTE,
  DEFAULT_GEOMETRY_STYLE_URL,
  createEmptyGeometryCollection,
  createGeometryCollectionSchema,
  isGeometryCollection,
  isGeometryExtensionConfig,
  normalizeGeometryConfig,
  readGeometryConfig,
  validateGeometryCollection,
} from "./geometry.js";
export type {
  GeometryExtensionConfig,
  GeoJsonGeometry,
  GeoJsonGeometryCollection,
  NormalizedGeometryConfig,
} from "./geometry.js";

export {
  registerAjvFormats,
  compileFormatValidator,
  type RegisterAjvFormatsOptions,
} from "./ajv.js";

export {
  READ_ONLY_ATTRIBUTE,
  HIDDEN_ATTRIBUTE,
  registerFieldFlagAttributes,
  readFieldBooleanFlag,
  isFieldReadOnly,
  isFieldHidden,
  setFieldBooleanFlag,
} from "./field-flags.js";

export {
  COMPUTED_ATTRIBUTE,
  createComputedBooleanSchema,
  createComputedIntegerSchema,
  createComputedNumberSchema,
  createComputedStringSchema,
  isComputedExtensionConfig,
  readComputedConfig,
} from "./computed.js";
export type { ComputedExtensionConfig } from "./computed.js";

export {
  createComputedCelEnvironment,
  evaluateComputedExpression,
  getComputedCelEnvironment,
  normalizeComputedValue,
} from "./computed-cel.js";
export type { ComputedEvaluationResult } from "./computed-cel.js";
