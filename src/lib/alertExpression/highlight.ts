import { tokenize, type TokenType } from "./tokenize";

export type HighlightSegment = {
  text: string;
  type: TokenType | null;
  isError: boolean;
};

export type TextRange = {
  start: number;
  end: number;
};

export const TOKEN_CLASS: Record<TokenType, string> = {
  keyword: "text-accent",
  function: "text-series-2",
  field: "text-ink",
  number: "text-series-4",
  string: "text-series-3",
  operator: "text-subtle",
  paren: "text-subtle",
  unknown: "text-down",
};

function baseSegments(text: string) {
  const segments: { start: number; end: number; type: TokenType | null }[] = [];
  let position = 0;
  for (const token of tokenize(text)) {
    if (token.start > position) segments.push({ start: position, end: token.start, type: null });
    segments.push({ start: token.start, end: token.end, type: token.type });
    position = token.end;
  }
  if (position < text.length) segments.push({ start: position, end: text.length, type: null });
  return segments;
}

function splitPoints(start: number, end: number, error: TextRange | null) {
  if (!error) return [start, end];
  const inner = [error.start, error.end].filter((point) => point > start && point < end);
  return [start, ...inner, end];
}

export function highlightSegments(text: string, error: TextRange | null = null): HighlightSegment[] {
  const segments: HighlightSegment[] = [];

  for (const segment of baseSegments(text)) {
    const points = splitPoints(segment.start, segment.end, error);
    for (let index = 0; index < points.length - 1; index++) {
      const [from, to] = [points[index], points[index + 1]];
      const isError = !!error && from >= error.start && to <= error.end;
      segments.push({ text: text.slice(from, to), type: segment.type, isError });
    }
  }

  if (error && error.start >= text.length) segments.push({ text: " ", type: null, isError: true });
  return segments;
}
