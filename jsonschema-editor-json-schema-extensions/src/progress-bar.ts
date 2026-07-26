import type { JsonSchemaAttributeRegistry, SchemaNode } from "@jsonschema-editor/json-schema";
import { NumberSchema } from "@jsonschema-editor/json-schema";
import { defaultExtensionsRegistry } from "./registry.js";

export const PROGRESS_BAR_ATTRIBUTE = "x-progress-bar";

export type ProgressBarColorMode = "solid" | "gradient";

export interface ProgressBarExtensionConfig {
  /** Range input step. Default: 0.1 */
  step?: number;
  /**
   * `solid` — one fill color; `gradient` — color by value from low→(mid)→high.
   * Default: `gradient`
   */
  colorMode?: ProgressBarColorMode;
  /** Solid fill color (`#rrggbb`). Used when `colorMode` is `solid`. */
  color?: string;
  /** Gradient low / start color. Default: `#dc2626` */
  colorLow?: string;
  /** Optional mid stop. Default: `#ca8a04` */
  colorMid?: string;
  /** Gradient high / end color. Default: `#16a34a` */
  colorHigh?: string;
}

export interface NormalizedProgressBarConfig {
  min: number;
  max: number;
  step: number;
  colorMode: ProgressBarColorMode;
  color: string;
  colorLow: string;
  colorMid: string;
  colorHigh: string;
}

export const DEFAULT_PROGRESS_BAR_COLOR = "#2563eb";
export const DEFAULT_PROGRESS_BAR_COLOR_LOW = "#dc2626";
export const DEFAULT_PROGRESS_BAR_COLOR_MID = "#ca8a04";
export const DEFAULT_PROGRESS_BAR_COLOR_HIGH = "#16a34a";

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;

export function isCssHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

function readOptionalHex(value: unknown): string | undefined {
  return isCssHexColor(value) ? value.toLowerCase() : undefined;
}

export function isProgressBarExtensionConfig(value: unknown): value is ProgressBarExtensionConfig | true {
  if (value === true) return true;
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.step !== undefined && (typeof record.step !== "number" || !(record.step > 0))) {
    return false;
  }
  if (
    record.colorMode !== undefined &&
    record.colorMode !== "solid" &&
    record.colorMode !== "gradient"
  ) {
    return false;
  }
  for (const key of ["color", "colorLow", "colorMid", "colorHigh"] as const) {
    if (record[key] !== undefined && !isCssHexColor(record[key])) return false;
  }
  return true;
}

export function readProgressBarConfig(node: SchemaNode): ProgressBarExtensionConfig | undefined {
  const raw = node.getCustomAttribute(PROGRESS_BAR_ATTRIBUTE);
  if (!isProgressBarExtensionConfig(raw)) return undefined;
  return raw === true ? {} : raw;
}

export function normalizeProgressBarConfig(
  node: SchemaNode,
  config?: ProgressBarExtensionConfig,
): NormalizedProgressBarConfig {
  const min =
    node instanceof NumberSchema && typeof node.minimum === "number" ? node.minimum : 0;
  const max =
    node instanceof NumberSchema && typeof node.maximum === "number" ? node.maximum : 10;
  return {
    min,
    max: max > min ? max : min + 10,
    step: config?.step && config.step > 0 ? config.step : 0.1,
    colorMode: config?.colorMode === "solid" ? "solid" : "gradient",
    color: readOptionalHex(config?.color) ?? DEFAULT_PROGRESS_BAR_COLOR,
    colorLow: readOptionalHex(config?.colorLow) ?? DEFAULT_PROGRESS_BAR_COLOR_LOW,
    colorMid: readOptionalHex(config?.colorMid) ?? DEFAULT_PROGRESS_BAR_COLOR_MID,
    colorHigh: readOptionalHex(config?.colorHigh) ?? DEFAULT_PROGRESS_BAR_COLOR_HIGH,
  };
}

/** 0…1 clamped ratio for a value in [min, max]. */
export function progressBarRatio(value: number, min: number, max: number): number {
  if (!(max > min)) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function parseHex(color: string): [number, number, number] | null {
  const match = HEX_COLOR.exec(color);
  if (!match) return null;
  const hex = match[1];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

function formatHex(r: number, g: number, b: number): string {
  const to = (n: number) =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function mixHexColors(from: string, to: string, t: number): string {
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return from;
  const clamped = Math.min(1, Math.max(0, t));
  return formatHex(
    a[0] + (b[0] - a[0]) * clamped,
    a[1] + (b[1] - a[1]) * clamped,
    a[2] + (b[2] - a[2]) * clamped,
  );
}

/** Fill / value color for the current numeric value. */
export function progressBarFillColor(
  value: number,
  config: Pick<
    NormalizedProgressBarConfig,
    "min" | "max" | "colorMode" | "color" | "colorLow" | "colorMid" | "colorHigh"
  >,
): string {
  if (config.colorMode === "solid") return config.color;
  const ratio = progressBarRatio(value, config.min, config.max);
  if (ratio <= 0.5) {
    return mixHexColors(config.colorLow, config.colorMid, ratio * 2);
  }
  return mixHexColors(config.colorMid, config.colorHigh, (ratio - 0.5) * 2);
}

/** Track background (muted solid or full gradient). */
export function progressBarTrackBackground(
  config: Pick<
    NormalizedProgressBarConfig,
    "colorMode" | "color" | "colorLow" | "colorMid" | "colorHigh"
  >,
): string {
  if (config.colorMode === "solid") {
    return config.color;
  }
  return `linear-gradient(90deg, ${config.colorLow}, ${config.colorMid}, ${config.colorHigh})`;
}

/** @deprecated Prefer progressBarTrackBackground(config). */
export function progressBarTrackGradient(
  config?: Pick<NormalizedProgressBarConfig, "colorLow" | "colorMid" | "colorHigh">,
): string {
  const low = config?.colorLow ?? DEFAULT_PROGRESS_BAR_COLOR_LOW;
  const mid = config?.colorMid ?? DEFAULT_PROGRESS_BAR_COLOR_MID;
  const high = config?.colorHigh ?? DEFAULT_PROGRESS_BAR_COLOR_HIGH;
  return `linear-gradient(90deg, ${low}, ${mid}, ${high})`;
}

export function createProgressBarSchema(
  options: {
    title?: string;
    description?: string;
    minimum?: number;
    maximum?: number;
    step?: number;
    colorMode?: ProgressBarColorMode;
    color?: string;
    colorLow?: string;
    colorMid?: string;
    colorHigh?: string;
  } = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): NumberSchema {
  const schema = new NumberSchema(registry);
  schema.title = options.title ?? "Progress";
  schema.description =
    options.description ?? "Numeric value rendered as a colored progress bar.";
  schema.minimum = options.minimum ?? 0;
  schema.maximum = options.maximum ?? 10;
  const config: ProgressBarExtensionConfig = {
    step: options.step ?? 0.1,
    colorMode: options.colorMode ?? "gradient",
  };
  if (options.color) config.color = options.color;
  if (options.colorLow) config.colorLow = options.colorLow;
  if (options.colorMid) config.colorMid = options.colorMid;
  if (options.colorHigh) config.colorHigh = options.colorHigh;
  schema.setCustomAttribute(PROGRESS_BAR_ATTRIBUTE, config);
  return schema;
}
