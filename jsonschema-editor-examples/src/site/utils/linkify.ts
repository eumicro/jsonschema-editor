export type TextPart = { type: "text" | "link"; value: string };

const urlPattern = /(https:\/\/[^\s]+)/g;

/** Split text into plain segments and https:// links (trailing punctuation stripped from URLs). */
export function paragraphParts(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({ type: "link", value: match[0].replace(/[.,)]$/, "") });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}
