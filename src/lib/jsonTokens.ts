export type JsonTokenKind = "key" | "string" | "literal" | "plain";

type JsonToken = { kind: JsonTokenKind; text: string };

const TOKEN_PATTERN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

export function jsonTokens(line: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(TOKEN_PATTERN)) {
    if (match.index > lastIndex) tokens.push({ kind: "plain", text: line.slice(lastIndex, match.index) });
    if (match[1] && match[2]) {
      tokens.push({ kind: "key", text: match[1] }, { kind: "plain", text: match[2] });
    } else {
      tokens.push({ kind: match[1] ? "string" : "literal", text: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) tokens.push({ kind: "plain", text: line.slice(lastIndex) });
  return tokens;
}
