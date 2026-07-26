import type { JsonSchemaAttributeRegistry, SchemaNode } from "@jsonschema-editor/json-schema";
import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  isCssHexColor,
  mixHexColors,
  progressBarFillColor,
  progressBarRatio,
} from "./progress-bar.js";
import { defaultExtensionsRegistry } from "./registry.js";

export const RATING_ATTRIBUTE = "x-rating";

export type RatingColorMode = "solid" | "gradient";

/**
 * Curated palette of freely selectable Unicode glyphs for `x-rating.symbol`.
 * Schema stores the chosen character itself (e.g. `"★"`), not a preset id.
 */
export const RATING_SYMBOL_PALETTE = [
  "★",
  "☆",
  "✦",
  "✧",
  "✪",
  "✯",
  "♥",
  "♡",
  "❤",
  "❥",
  "●",
  "○",
  "◆",
  "◇",
  "■",
  "□",
  "▲",
  "△",
  "♦",
  "♤",
  "♧",
  "♣",
  "⚡",
  "☀",
  "☁",
  "☂",
  "❄",
  "♨",
  "⚑",
  "⚐",
  "✈",
  "⚓",
  "⚔",
  "⚙",
  "✿",
  "❀",
  "❁",
  "✾",
  "☺",
  "☻",
  "♪",
  "♫",
  "✓",
  "✔",
  "✕",
  "✖",
  "✚",
  "✱",
  "👍",
  "👎",
  "🔥",
  "💯",
  "⭐",
  "🌟",
  "💡",
  "🎯",
  "🏆",
  "💎",
  "🍀",
  "🌸",
] as const;

/** @deprecated Use glyph strings in `symbol`; kept for reading legacy configs. */
export const RATING_SYMBOLS = [
  "star",
  "heart",
  "circle",
  "diamond",
  "thumb",
  "smile",
  "flag",
  "bolt",
] as const;

/** @deprecated Legacy preset ids. */
export type RatingSymbol = (typeof RATING_SYMBOLS)[number];

/** @deprecated Legacy preset → glyph map. */
export const RATING_SYMBOL_CHARS: Record<RatingSymbol, string> = {
  star: "★",
  heart: "♥",
  circle: "●",
  diamond: "◆",
  thumb: "👍",
  smile: "☺",
  flag: "⚑",
  bolt: "⚡",
};

export const DEFAULT_RATING_SYMBOL = "★";

export interface RatingExtensionConfig {
  /**
   * Unicode glyph shown for each rating step (e.g. `"★"`, `"♥"`, `"🔥"`).
   * Legacy preset ids (`star`, `heart`, …) are still accepted when reading.
   */
  symbol?: string;
  /**
   * @deprecated Prefer `symbol` as the glyph. Still read for backwards compatibility.
   */
  character?: string;
  /** Value step between symbols. Default: 1 */
  step?: number;
  /**
   * `solid` — one color; `gradient` — color by value from low→(mid)→high.
   * Default: `gradient`
   */
  colorMode?: RatingColorMode;
  /** Solid fill color (`#rrggbb`). */
  color?: string;
  colorLow?: string;
  colorMid?: string;
  colorHigh?: string;
}

export interface NormalizedRatingConfig {
  min: number;
  max: number;
  step: number;
  /** Resolved display glyph. */
  symbol: string;
  /** Alias of `symbol` for existing form-field code. */
  character: string;
  colorMode: RatingColorMode;
  color: string;
  colorLow: string;
  colorMid: string;
  colorHigh: string;
}

export const DEFAULT_RATING_COLOR = "#f59e0b";
export const DEFAULT_RATING_COLOR_LOW = "#dc2626";
export const DEFAULT_RATING_COLOR_MID = "#ca8a04";
export const DEFAULT_RATING_COLOR_HIGH = "#16a34a";

function readOptionalHex(value: unknown): string | undefined {
  return isCssHexColor(value) ? value.toLowerCase() : undefined;
}

/** @deprecated Prefer {@link isRatingSymbolGlyph}. */
export function isRatingSymbol(value: unknown): value is RatingSymbol {
  return typeof value === "string" && (RATING_SYMBOLS as readonly string[]).includes(value);
}

function graphemeCount(value: string): number {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...segmenter.segment(value)].length;
  }
  return [...value].length;
}

/** True for a freely chosen glyph (1–2 grapheme clusters) or a legacy preset id. */
export function isRatingSymbolGlyph(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isRatingSymbol(trimmed)) return true;
  const count = graphemeCount(trimmed);
  return count >= 1 && count <= 2;
}

export function resolveRatingSymbolGlyph(
  symbol?: string,
  character?: string,
): string {
  if (character && isRatingSymbolGlyph(character) && !isRatingSymbol(character)) {
    return character.trim();
  }
  if (symbol && isRatingSymbol(symbol)) {
    return RATING_SYMBOL_CHARS[symbol];
  }
  if (symbol && isRatingSymbolGlyph(symbol)) {
    return symbol.trim();
  }
  return DEFAULT_RATING_SYMBOL;
}

export function isRatingExtensionConfig(value: unknown): value is RatingExtensionConfig | true {
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
  if (record.symbol !== undefined && !isRatingSymbolGlyph(record.symbol)) return false;
  if (record.character !== undefined && !isRatingSymbolGlyph(record.character)) return false;
  for (const key of ["color", "colorLow", "colorMid", "colorHigh"] as const) {
    if (record[key] !== undefined && !isCssHexColor(record[key])) return false;
  }
  return true;
}

export function readRatingConfig(node: SchemaNode): RatingExtensionConfig | undefined {
  const raw = node.getCustomAttribute(RATING_ATTRIBUTE);
  if (!isRatingExtensionConfig(raw)) return undefined;
  return raw === true ? {} : raw;
}

export function normalizeRatingConfig(
  node: SchemaNode,
  config?: RatingExtensionConfig,
): NormalizedRatingConfig {
  const min =
    node instanceof NumberSchema && typeof node.minimum === "number" ? node.minimum : 0;
  const max =
    node instanceof NumberSchema && typeof node.maximum === "number" ? node.maximum : 5;
  const glyph = resolveRatingSymbolGlyph(config?.symbol, config?.character);
  return {
    min,
    max: max > min ? max : min + 5,
    step: config?.step && config.step > 0 ? config.step : 1,
    symbol: glyph,
    character: glyph,
    colorMode: config?.colorMode === "solid" ? "solid" : "gradient",
    color: readOptionalHex(config?.color) ?? DEFAULT_RATING_COLOR,
    colorLow: readOptionalHex(config?.colorLow) ?? DEFAULT_RATING_COLOR_LOW,
    colorMid: readOptionalHex(config?.colorMid) ?? DEFAULT_RATING_COLOR_MID,
    colorHigh: readOptionalHex(config?.colorHigh) ?? DEFAULT_RATING_COLOR_HIGH,
  };
}

/** Discrete selectable values from the first active step up to max. */
export function ratingLevels(config: Pick<NormalizedRatingConfig, "min" | "max" | "step">): number[] {
  const step = config.step > 0 ? config.step : 1;
  const start = config.min === 0 ? step : config.min;
  const levels: number[] = [];
  for (let value = start; value <= config.max + 1e-9; value += step) {
    levels.push(Number(value.toFixed(6)));
  }
  return levels.length > 0 ? levels : [config.max];
}

export function ratingFillColor(
  value: number,
  config: Pick<
    NormalizedRatingConfig,
    "min" | "max" | "colorMode" | "color" | "colorLow" | "colorMid" | "colorHigh"
  >,
): string {
  return progressBarFillColor(value, config);
}

export function ratingRatio(value: number, min: number, max: number): number {
  return progressBarRatio(value, min, max);
}

/** Re-export for attribute UIs that already use progress-bar color mixing. */
export { mixHexColors };

export function createRatingSchema(
  options: {
    title?: string;
    description?: string;
    minimum?: number;
    maximum?: number;
    step?: number;
    /** Glyph or legacy preset id. */
    symbol?: string;
    colorMode?: RatingColorMode;
    color?: string;
    colorLow?: string;
    colorMid?: string;
    colorHigh?: string;
  } = {},
  registry: JsonSchemaAttributeRegistry = defaultExtensionsRegistry,
): NumberSchema {
  const schema = new NumberSchema(registry);
  schema.title = options.title ?? "Rating";
  schema.description =
    options.description ?? "Numeric rating rendered as selectable symbols.";
  schema.minimum = options.minimum ?? 0;
  schema.maximum = options.maximum ?? 5;
  const config: RatingExtensionConfig = {
    step: options.step ?? 1,
    symbol: resolveRatingSymbolGlyph(options.symbol),
    colorMode: options.colorMode ?? "gradient",
  };
  if (options.color) config.color = options.color;
  if (options.colorLow) config.colorLow = options.colorLow;
  if (options.colorMid) config.colorMid = options.colorMid;
  if (options.colorHigh) config.colorHigh = options.colorHigh;
  schema.setCustomAttribute(RATING_ATTRIBUTE, config);
  return schema;
}
