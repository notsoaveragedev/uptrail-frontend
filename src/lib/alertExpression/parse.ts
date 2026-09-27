import type { CompareOperator, ExpressionNode, ExpressionOperand, ExpressionValue } from "@/types/alerts";
import {
  closestMatch,
  FIELDS,
  findField,
  FUNCTION_HINTS,
  OPERATORS_BY_TYPE,
  operandField,
  type FieldDefinition,
} from "./catalog";
import { splitNumber, stringContent, tokenize, type Token } from "./tokenize";

export type ParseError = {
  message: string;
  start: number;
  end: number;
  line: number;
  column: number;
};

export type ParseResult = { ok: true; ast: ExpressionNode } | { ok: false; error: ParseError };

type Range = { start: number; end: number };

class ExpressionError extends Error {
  range: Range;

  constructor(message: string, range: Range) {
    super(message);
    this.range = range;
  }
}

function fail(message: string, range: Range): never {
  throw new ExpressionError(message, range);
}

function positionOf(text: string, offset: number) {
  const lines = text.slice(0, offset).split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function combine(type: "and" | "or", children: ExpressionNode[]): ExpressionNode {
  const flat = children.flatMap((child) => (child.type === type ? child.children : [child]));
  return flat.length === 1 ? flat[0] : { type, children: flat };
}

function quoteList(values: string[]) {
  const quoted = values.map((value) => `"${value}"`);
  return `${quoted.slice(0, -1).join(", ")} or ${quoted.at(-1)}`;
}

function unknownFieldMessage(name: string) {
  const guess = closestMatch(
    name,
    FIELDS.map((field) => field.name),
  );
  return guess ? `Unknown field "${name}". Did you mean "${guess}"?` : `Unknown field "${name}"`;
}

function numberValue(field: FieldDefinition, token: Token) {
  const { amount, unit } = splitNumber(token.value);
  if (!unit) return amount;
  if (!field.units) fail(`${field.name} doesn't take a unit`, token);
  const multiplier = field.units[unit];
  if (multiplier === undefined) {
    fail(`Unknown unit "${unit}" for ${field.name}. Use ${Object.keys(field.units).join(" or ")}`, token);
  }
  return amount * multiplier;
}

function enumValue(field: FieldDefinition, token: Token) {
  const values = field.values ?? [];
  if (token.type !== "string") fail(`${field.name} expects ${quoteList(values)}`, token);
  const value = stringContent(token.value);
  if (values.includes(value)) return value;
  const guess = closestMatch(value, values);
  fail(
    guess ? `Unknown ${field.name} "${value}". Did you mean "${guess}"?` : `${field.name} must be ${quoteList(values)}`,
    token,
  );
}

export function parse(text: string): ParseResult {
  const tokens = tokenize(text);
  let index = 0;

  const peek = () => tokens[index] as Token | undefined;
  const advance = () => tokens[index++];
  const endOfInput = { start: text.length, end: text.length };
  const nextRange = () => peek() ?? endOfInput;
  const columnOf = (range: Range) => positionOf(text, range.start).column;
  const isKeyword = (token: Token | undefined, word: string) =>
    token?.type === "keyword" && token.value.toLowerCase() === word;
  const isParen = (token: Token | undefined, paren: string) => token?.type === "paren" && token.value === paren;

  function parseOr(): ExpressionNode {
    const children = [parseAnd()];
    while (isKeyword(peek(), "or")) {
      advance();
      children.push(parseAnd());
    }
    return combine("or", children);
  }

  function parseAnd(): ExpressionNode {
    const children = [parsePrimary()];
    while (isKeyword(peek(), "and")) {
      advance();
      children.push(parsePrimary());
    }
    return combine("and", children);
  }

  function parsePrimary(): ExpressionNode {
    const open = peek();
    if (!isParen(open, "(")) return parseComparison();
    advance();
    const node = parseOr();
    if (!isParen(peek(), ")")) {
      fail(`Expected ')' to close the '(' at column ${columnOf(open!)}`, nextRange());
    }
    advance();
    return node;
  }

  function parseComparison(): ExpressionNode {
    const left = parseOperand();
    const field = operandField(left);
    const op = parseOperator(field);
    const right = parseValue(field, op);
    return { type: "compare", op: op.value as CompareOperator, left, right };
  }

  function parseOperand(): ExpressionOperand {
    const token = peek();
    const previous = tokens[index - 1];
    if (!token) {
      const after = previous ? ` after '${previous.value}'` : "";
      fail(`Expected a condition${after} at column ${columnOf(endOfInput)}`, endOfInput);
    }
    if (token.type === "function") return parseCall();
    if (token.type !== "field") fail(`Expected a metric like latency or p95(latency), found '${token.value}'`, token);
    advance();
    if (isParen(peek(), "(")) {
      const guess = closestMatch(token.value, Object.keys(FUNCTION_HINTS));
      fail(`Unknown function "${token.value}".${guess ? ` Did you mean "${guess}"?` : ""}`, token);
    }
    if (!findField(token.value)) fail(unknownFieldMessage(token.value), token);
    return { type: "field", name: token.value };
  }

  function parseCall(): ExpressionOperand {
    const name = advance();
    if (!isParen(peek(), "(")) fail(`Expected '(' after ${name.value}`, nextRange());
    advance();
    const arg = peek();
    if (arg?.type !== "field") fail(`Expected a metric inside ${name.value}( )`, nextRange());
    const field = findField(arg.value);
    if (!field) fail(unknownFieldMessage(arg.value), arg);
    if (!field.isAggregatable) fail(`${name.value}() only works with latency`, arg);
    advance();
    if (!isParen(peek(), ")")) fail(`Expected ')' to close ${name.value}(`, nextRange());
    advance();
    return { type: "fn", name: name.value, arg: arg.value };
  }

  function parseOperator(field: FieldDefinition) {
    const token = peek();
    const previous = tokens[index - 1];
    if (token?.value === "=") fail("Use '==' to compare, not '='", token);
    if (token?.type !== "operator") {
      fail(`Expected an operator after ${previous.value}, like > or ==`, nextRange());
    }
    const allowed = OPERATORS_BY_TYPE[field.type];
    if (!allowed.includes(token.value as CompareOperator)) {
      fail(`${field.name} can only be compared with ${allowed.join(" or ")}`, token);
    }
    return advance();
  }

  function parseValue(field: FieldDefinition, op: Token): ExpressionValue {
    const token = peek();
    const isValue = token?.type === "number" || token?.type === "string";
    if (token?.type === "unknown" && /^["']/.test(token.value)) fail("Missing closing quote", token);
    if (!isValue) {
      fail(`Expected a value after '${op.value}' at column ${columnOf(nextRange())}`, nextRange());
    }
    if (field.type === "number" && token.type === "string") {
      fail(`${field.name} expects a number, not a string`, token);
    }
    advance();
    return field.type === "enum" ? enumValue(field, token) : numberValue(field, token);
  }

  function rejectTrailing(token: Token): never {
    if (token.value === "for") fail("Set the duration in the For field, not in the expression", token);
    if (isParen(token, ")")) fail("Unexpected ')' with no matching '('", token);
    fail(`Expected 'and' or 'or' before '${token.value}'`, token);
  }

  try {
    if (tokens.length === 0) fail("Write a condition, like p95(latency) > 800", endOfInput);
    const ast = parseOr();
    const rest = peek();
    if (rest) rejectTrailing(rest);
    return { ok: true, ast };
  } catch (error) {
    if (!(error instanceof ExpressionError)) throw error;
    const { start, end } = error.range;
    return { ok: false, error: { message: error.message, start, end, ...positionOf(text, start) } };
  }
}
