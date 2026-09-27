export type TokenType = "keyword" | "function" | "field" | "number" | "string" | "operator" | "paren" | "unknown";

export type Token = {
  type: TokenType;
  value: string;
  start: number;
  end: number;
};

export const KEYWORDS = ["and", "or"];

export const FUNCTION_NAMES = ["avg", "p50", "p95", "p99", "max"];

const OPERATORS = [">=", "<=", "==", "!=", ">", "<"];

const IDENTIFIER = /[A-Za-z_][A-Za-z0-9_]*/y;
const NUMBER = /\d+(?:\.\d+)?(?:[A-Za-z%]+)?/y;
const WHITESPACE = /\s+/y;

function matchAt(pattern: RegExp, text: string, position: number) {
  pattern.lastIndex = position;
  return pattern.exec(text)?.[0] ?? null;
}

function identifierType(word: string): TokenType {
  if (KEYWORDS.includes(word.toLowerCase())) return "keyword";
  if (FUNCTION_NAMES.includes(word)) return "function";
  return "field";
}

function readString(text: string, start: number) {
  const quote = text[start];
  const close = text.indexOf(quote, start + 1);
  const end = close === -1 ? text.length : close + 1;
  return { value: text.slice(start, end), isClosed: close !== -1 };
}

function readToken(text: string, position: number): Token {
  const char = text[position];
  const token = (type: TokenType, value: string) => ({ type, value, start: position, end: position + value.length });

  const word = matchAt(IDENTIFIER, text, position);
  if (word) return token(identifierType(word), word);

  const number = matchAt(NUMBER, text, position);
  if (number) return token("number", number);

  if (char === '"' || char === "'") {
    const { value, isClosed } = readString(text, position);
    return token(isClosed ? "string" : "unknown", value);
  }

  const operator = OPERATORS.find((candidate) => text.startsWith(candidate, position));
  if (operator) return token("operator", operator);

  if (char === "(" || char === ")") return token("paren", char);

  return token("unknown", char);
}

export function tokenize(text: string) {
  const tokens: Token[] = [];
  let position = 0;

  while (position < text.length) {
    const space = matchAt(WHITESPACE, text, position);
    if (space) {
      position += space.length;
      continue;
    }
    const token = readToken(text, position);
    tokens.push(token);
    position = token.end;
  }

  return tokens;
}

export function splitNumber(value: string) {
  const match = /^([\d.]+)(.*)$/.exec(value);
  return { amount: Number(match?.[1] ?? value), unit: match?.[2] ?? "" };
}

export function stringContent(value: string) {
  return value.slice(1, -1);
}
