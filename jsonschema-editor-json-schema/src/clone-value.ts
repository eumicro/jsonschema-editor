/**
 * Deep-clones JSON-compatible values for schema/UI attribute maps.
 *
 * Prefer {@link structuredClone}; fall back to JSON round-trip when the value is a
 * Vue (or other) Proxy — browsers throw {@code DOMException: Proxy object could not be cloned}.
 */
export function cloneJsonCompatible<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
