export {
  registerDefaultVueExtensions,
  formatFieldsExtension,
  ExtendedFormatFormField,
  valuesSourceExtension,
  ValuesSourceFormField,
  geometryExtension,
  GeometryCollectionFormField,
  computedExtension,
  ComputedFormField,
  fileExtension,
  FileFieldFormField,
  provideFileFieldProvider,
  useFileFieldProvider,
  FILE_FIELD_PROVIDER_KEY,
  createInMemoryFileFieldProvider,
} from "./register.js";
export type { InMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";
