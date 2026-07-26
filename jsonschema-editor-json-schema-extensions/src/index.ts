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
  dateTodayExtension,
  validateDateToday,
  todayIsoDate,
  DATE_TODAY_FORMAT,
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

export {
  collectComputedFieldBindings,
  syncComputedFormData,
} from "./computed-sync.js";
export type { ComputedFieldBinding } from "./computed-sync.js";

export {
  FILE_ATTRIBUTE,
  createMultipleFileSchema,
  createSingleFileSchema,
  isFileDescriptor,
  isFileExtensionConfig,
  isPreviewableMimeType,
  guessMimeTypeFromFileName,
  matchesFileAccept,
  normalizeFileConfig,
  readFileConfig,
  resolveUploadMimeType,
  validateFileDescriptor,
  validateFileFieldValue,
} from "./file.js";
export type {
  FileDescriptor,
  FileExtensionConfig,
  FileFieldContext,
  FileFieldProvider,
  NormalizedFileConfig,
} from "./file.js";

export {
  PROGRESS_BAR_ATTRIBUTE,
  DEFAULT_PROGRESS_BAR_COLOR,
  DEFAULT_PROGRESS_BAR_COLOR_HIGH,
  DEFAULT_PROGRESS_BAR_COLOR_LOW,
  DEFAULT_PROGRESS_BAR_COLOR_MID,
  createProgressBarSchema,
  isCssHexColor,
  isProgressBarExtensionConfig,
  mixHexColors,
  normalizeProgressBarConfig,
  progressBarFillColor,
  progressBarRatio,
  progressBarTrackBackground,
  progressBarTrackGradient,
  readProgressBarConfig,
} from "./progress-bar.js";
export type {
  NormalizedProgressBarConfig,
  ProgressBarColorMode,
  ProgressBarExtensionConfig,
} from "./progress-bar.js";

export {
  RATING_ATTRIBUTE,
  RATING_SYMBOLS,
  RATING_SYMBOL_CHARS,
  RATING_SYMBOL_PALETTE,
  DEFAULT_RATING_SYMBOL,
  DEFAULT_RATING_COLOR,
  DEFAULT_RATING_COLOR_HIGH,
  DEFAULT_RATING_COLOR_LOW,
  DEFAULT_RATING_COLOR_MID,
  createRatingSchema,
  isRatingExtensionConfig,
  isRatingSymbol,
  isRatingSymbolGlyph,
  normalizeRatingConfig,
  ratingFillColor,
  ratingLevels,
  ratingRatio,
  readRatingConfig,
  resolveRatingSymbolGlyph,
} from "./rating.js";
export type {
  NormalizedRatingConfig,
  RatingColorMode,
  RatingExtensionConfig,
  RatingSymbol,
} from "./rating.js";
