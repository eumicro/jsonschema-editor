import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const KEYWORDS = new Set([
  "as",
  "break",
  "const",
  "continue",
  "else",
  "for",
  "function",
  "if",
  "import",
  "in",
  "let",
  "loop",
  "package",
  "namespace",
  "return",
  "var",
  "void",
  "while",
]);

const BUILTINS = new Set([
  "size",
  "has",
  "matches",
  "startsWith",
  "endsWith",
  "contains",
  "int",
  "uint",
  "double",
  "string",
  "bytes",
  "duration",
  "timestamp",
  "type",
  "dyn",
  "list",
  "map",
  "filter",
  "exists",
  "exists_one",
  "all",
  "sum",
]);

type CelState = {
  /** Next identifier is a member after `.`. */
  afterDot: boolean;
};

function looksLikeCall(stream: { pos: number; string: string }): boolean {
  return /^\s*\(/.test(stream.string.slice(stream.pos));
}

/** Lightweight CEL tokenizer for syntax highlighting (StreamLanguage). */
export const celLanguage = StreamLanguage.define<CelState>({
  name: "cel",
  startState: () => ({ afterDot: false }),
  token(stream, state) {
    if (stream.eatSpace()) return null;

    if (stream.match("//")) {
      state.afterDot = false;
      stream.skipToEnd();
      return "comment";
    }

    if (stream.match(/"(?:\\.|[^\\"])*"/) || stream.match(/'(?:\\.|[^\\'])*'/)) {
      state.afterDot = false;
      return "string";
    }

    if (stream.match(/0[xX][0-9a-fA-F]+/) || stream.match(/\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)) {
      state.afterDot = false;
      return "number";
    }

    if (stream.peek() === ".") {
      stream.next();
      state.afterDot = true;
      return "punctuation";
    }

    if (stream.match(/[+\-*/%<>=!&|^~?:]+/)) {
      state.afterDot = false;
      return "operator";
    }

    if (stream.match(/[[\](){},;]/)) {
      state.afterDot = false;
      return "punctuation";
    }

    if (stream.match(/[A-Za-z_][A-Za-z0-9_]*/)) {
      const word = stream.current();
      const isCall = looksLikeCall(stream);
      const afterDot = state.afterDot;
      state.afterDot = false;

      if (word === "true" || word === "false") return "bool";
      if (word === "null") return "null";
      if (KEYWORDS.has(word)) return "keyword";

      if (afterDot) {
        if (isCall || BUILTINS.has(word)) return "method";
        return "property";
      }

      if (word === "data") return "dataRoot";
      if (BUILTINS.has(word) || isCall) return "function";
      return "variableName";
    }

    stream.next();
    state.afterDot = false;
    return null;
  },
  languageData: {
    commentTokens: { line: "//" },
  },
  tokenTable: {
    comment: t.comment,
    string: t.string,
    number: t.number,
    operator: t.operator,
    punctuation: t.punctuation,
    keyword: t.keyword,
    bool: t.bool,
    null: t.null,
    dataRoot: t.special(t.variableName),
    property: t.propertyName,
    method: t.special(t.function(t.variableName)),
    function: t.function(t.variableName),
    variableName: t.variableName,
  },
});

/**
 * Highlight style that separates form data (`data` / properties) from functions/methods.
 * Colors fall back to concrete values when CSS variables are unset.
 */
export const celHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "var(--jse-cel-comment, #64748b)", fontStyle: "italic" },
  { tag: t.string, color: "var(--jse-cel-string, #0f766e)" },
  { tag: t.number, color: "var(--jse-cel-number, #b45309)" },
  { tag: t.bool, color: "var(--jse-cel-keyword, #1d4ed8)", fontWeight: "600" },
  { tag: t.null, color: "var(--jse-cel-keyword, #1d4ed8)", fontWeight: "600" },
  { tag: t.keyword, color: "var(--jse-cel-keyword, #1d4ed8)", fontWeight: "600" },
  { tag: t.operator, color: "var(--jse-cel-operator, #475569)" },
  { tag: t.punctuation, color: "var(--jse-cel-punctuation, #64748b)" },
  {
    tag: t.special(t.variableName),
    color: "var(--jse-cel-data, #0f766e)",
    fontWeight: "700",
  },
  {
    tag: t.variableName,
    color: "var(--jse-cel-variable, #0e7490)",
  },
  {
    tag: t.propertyName,
    color: "var(--jse-cel-property, #0369a1)",
  },
  {
    tag: t.function(t.variableName),
    color: "var(--jse-cel-function, #c2410c)",
    fontWeight: "600",
  },
  {
    tag: t.special(t.function(t.variableName)),
    color: "var(--jse-cel-method, #ea580c)",
    fontWeight: "600",
  },
]);

/** Language support highlighting for CEL expressions. */
export function celSyntaxHighlighting() {
  return syntaxHighlighting(celHighlightStyle);
}
