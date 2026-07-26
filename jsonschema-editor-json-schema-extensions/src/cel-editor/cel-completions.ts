import {
  autocompletion,
  completionKeymap,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from "@codemirror/autocomplete";
import { keymap } from "@codemirror/view";
import {
  emptyCelDataPathIndex,
  type CelDataPathIndex,
} from "./cel-data-paths.js";

const LIST_METHOD_COMPLETIONS: Completion[] = [
  {
    label: "map",
    type: "method",
    detail: "list.map(x, expr)",
    apply: "map(x, )",
  },
  {
    label: "filter",
    type: "method",
    detail: "list.filter(x, expr)",
    apply: "filter(x, )",
  },
  {
    label: "exists",
    type: "method",
    detail: "list.exists(x, expr)",
    apply: "exists(x, )",
  },
  {
    label: "exists_one",
    type: "method",
    detail: "list.exists_one(x, expr)",
    apply: "exists_one(x, )",
  },
  {
    label: "all",
    type: "method",
    detail: "list.all(x, expr)",
    apply: "all(x, )",
  },
  {
    label: "sum",
    type: "method",
    detail: "list.sum()",
    info: "Extension helper registered for x-computed (sum of numeric list).",
    apply: "sum()",
  },
];

const CEL_COMPLETIONS: Completion[] = [
  {
    label: "data",
    type: "variable",
    detail: "root form data",
    info: "Root binding for the full form data object.",
  },
  { label: "true", type: "keyword" },
  { label: "false", type: "keyword" },
  { label: "null", type: "keyword" },
  { label: "in", type: "keyword" },
  {
    label: "size",
    type: "function",
    detail: "size(x)",
    apply: "size()",
  },
  {
    label: "has",
    type: "function",
    detail: "has(msg.field)",
    apply: "has()",
  },
  {
    label: "int",
    type: "function",
    detail: "int(x)",
    apply: "int()",
  },
  {
    label: "uint",
    type: "function",
    detail: "uint(x)",
    apply: "uint()",
  },
  {
    label: "double",
    type: "function",
    detail: "double(x)",
    apply: "double()",
  },
  {
    label: "string",
    type: "function",
    detail: "string(x)",
    apply: "string()",
  },
  {
    label: "matches",
    type: "method",
    detail: "string.matches(regex)",
    apply: "matches()",
  },
  {
    label: "startsWith",
    type: "method",
    detail: "string.startsWith(prefix)",
    apply: "startsWith()",
  },
  {
    label: "endsWith",
    type: "method",
    detail: "string.endsWith(suffix)",
    apply: "endsWith()",
  },
  {
    label: "contains",
    type: "method",
    detail: "string.contains(sub)",
    apply: "contains()",
  },
  ...LIST_METHOD_COMPLETIONS,
  {
    label: "duration",
    type: "function",
    detail: "duration(string)",
    apply: "duration()",
  },
  {
    label: "timestamp",
    type: "function",
    detail: "timestamp(string)",
    apply: "timestamp()",
  },
  {
    label: "type",
    type: "function",
    detail: "type(x)",
    apply: "type()",
  },
  {
    label: "dyn",
    type: "function",
    detail: "dyn(x)",
    apply: "dyn()",
  },
];

function dataFieldCompletions(index: CelDataPathIndex): Completion[] {
  const options: Completion[] = index.paths.map((path) => ({
    label: path,
    type: "property",
    detail: "schema field",
    boost: 2,
  }));

  for (const [arrayPath, props] of index.arrayItemProps) {
    for (const prop of props) {
      options.push({
        label: `${arrayPath}.map(p, p.${prop})`,
        type: "function",
        detail: "array item field",
        boost: 1,
        apply: `${arrayPath}.map(p, p.${prop})`,
      });
    }
  }

  return options;
}

function memberCompletions(
  index: CelDataPathIndex,
  parentPath: string,
): Completion[] {
  const options: Completion[] = [];
  for (const name of index.childrenOf.get(parentPath) ?? []) {
    options.push({
      label: name,
      type: "property",
      detail: `${parentPath}.${name}`,
      boost: 3,
    });
  }

  const itemProps = index.arrayItemProps.get(parentPath);
  if (itemProps) {
    for (const prop of itemProps) {
      options.push({
        label: `map(p, p.${prop})`,
        type: "function",
        detail: `item field of ${parentPath}`,
        boost: 2,
        apply: `map(p, p.${prop})`,
      });
    }
    options.push(...LIST_METHOD_COMPLETIONS);
  }

  return options;
}

/** Next path segment after `prefix` (empty = top-level item fields). */
function itemSegmentCompletions(
  index: CelDataPathIndex,
  prefix: string,
): Completion[] {
  const options: Completion[] = [];
  const seen = new Set<string>();
  for (const rel of index.itemRelativePaths) {
    let segment: string | undefined;
    if (!prefix) {
      segment = rel.split(".")[0];
    } else if (rel.startsWith(`${prefix}.`)) {
      segment = rel.slice(prefix.length + 1).split(".")[0];
    }
    if (!segment || seen.has(segment)) continue;
    seen.add(segment);
    options.push({
      label: segment,
      type: "property",
      detail: prefix ? `p.${prefix}.${segment}` : "item field",
      boost: 3,
    });
  }
  return options;
}

function createCelCompletionSource(index: CelDataPathIndex) {
  const fieldOptions = dataFieldCompletions(index);

  return (context: CompletionContext): CompletionResult | null => {
    const before = context.state.doc.sliceString(Math.max(0, context.pos - 200), context.pos);

    const member = before.match(
      /(?:^|[^A-Za-z0-9_])([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)*)\.([A-Za-z_][\w]*)?$/,
    );
    if (member) {
      const parentPath = member[1]!;
      const partial = member[2] ?? "";

      if (parentPath === "data" || parentPath.startsWith("data.")) {
        const options = memberCompletions(index, parentPath);
        if (options.length === 0 && !context.explicit) return null;
        return {
          from: context.pos - partial.length,
          options,
          validFor: /^[\w]*$/,
        };
      }

      const dot = parentPath.indexOf(".");
      const relativePrefix = dot === -1 ? "" : parentPath.slice(dot + 1);
      const options = itemSegmentCompletions(index, relativePrefix);
      if (options.length === 0 && !context.explicit) return null;
      return {
        from: context.pos - partial.length,
        options,
        validFor: /^[\w]*$/,
      };
    }

    const word = context.matchBefore(/[A-Za-z_][\w.]*/);
    if (!word && !context.explicit) return null;

    return {
      from: word ? word.from : context.pos,
      options: [...fieldOptions, ...CEL_COMPLETIONS],
      validFor: /^[\w.]*$/,
    };
  };
}

/** Autocomplete extension for CEL keywords, macros, `data`, and schema fields. */
export function celAutocompletion(index: CelDataPathIndex = emptyCelDataPathIndex()) {
  return [
    autocompletion({
      override: [createCelCompletionSource(index)],
      activateOnTyping: true,
      defaultKeymap: true,
    }),
    keymap.of(completionKeymap),
  ];
}

export { CEL_COMPLETIONS };
