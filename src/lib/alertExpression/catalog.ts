import { latencyText } from "@/lib/format";
import { REGIONS } from "@/lib/monitors";
import type { CompareOperator, ExpressionOperand, ExpressionValue } from "@/types/alerts";
import { FUNCTION_NAMES, KEYWORDS, tokenize, type Token } from "./tokenize";

export type FieldType = "number" | "enum";

export type FieldDefinition = {
  name: string;
  type: FieldType;
  hint: string;
  defaultValue: ExpressionValue;
  unit?: string;
  units?: Record<string, number>;
  values?: string[];
  isAggregatable?: boolean;
};

export type SuggestionKind = "fn" | "field" | "kw" | "op" | "value";

export type Suggestion = {
  kind: SuggestionKind;
  label: string;
  insert: string;
  hint: string;
};

export type SuggestionResult = {
  from: number;
  to: number;
  items: Suggestion[];
};

export const FIELDS: FieldDefinition[] = [
  {
    name: "status",
    type: "enum",
    values: ["up", "down", "degraded"],
    defaultValue: "down",
    hint: "Result of the latest check",
  },
  {
    name: "latency",
    type: "number",
    unit: "ms",
    units: { ms: 1, s: 1000 },
    defaultValue: 800,
    isAggregatable: true,
    hint: "Response time of a check",
  },
  {
    name: "error_rate",
    type: "number",
    unit: "%",
    units: { "%": 1 },
    defaultValue: 5,
    hint: "Failed checks in the last 5 minutes",
  },
  {
    name: "ssl_days_remaining",
    type: "number",
    unit: "d",
    units: { d: 1 },
    defaultValue: 14,
    hint: "Days until the certificate expires",
  },
  { name: "status_code", type: "number", defaultValue: 500, hint: "HTTP status of the response" },
  {
    name: "region",
    type: "enum",
    values: REGIONS.map((region) => region.code),
    defaultValue: "FRA",
    hint: "Region that ran the check",
  },
  { name: "region_count", type: "number", defaultValue: 2, hint: "Regions failing at the same time" },
];

export const FUNCTION_HINTS: Record<string, string> = {
  avg: "Mean over a 5 minute window",
  p50: "Median over a 5 minute window",
  p95: "95th percentile over 5 minutes",
  p99: "99th percentile over 5 minutes",
  max: "Slowest check in 5 minutes",
};

export const OPERATORS_BY_TYPE: Record<FieldType, CompareOperator[]> = {
  number: [">", ">=", "<", "<=", "==", "!="],
  enum: ["==", "!="],
};

const OPERATOR_HINTS: Record<CompareOperator, string> = {
  ">": "greater than",
  ">=": "at least",
  "<": "less than",
  "<=": "at most",
  "==": "equals",
  "!=": "not equal to",
};

const KEYWORD_HINTS: Record<string, string> = {
  and: "both conditions must hold",
  or: "either condition holds",
};

export function findField(name: string) {
  return FIELDS.find((field) => field.name === name);
}

export function operandFieldName(operand: ExpressionOperand) {
  return operand.type === "fn" ? operand.arg : operand.name;
}

export function operandField(operand: ExpressionOperand) {
  return findField(operandFieldName(operand)) ?? FIELDS[0];
}

export function operandKey(operand: ExpressionOperand) {
  return operand.type === "fn" ? `${operand.name}(${operand.arg})` : operand.name;
}

export function operandFromKey(key: string): ExpressionOperand {
  const match = /^(\w+)\((\w+)\)$/.exec(key);
  return match ? { type: "fn", name: match[1], arg: match[2] } : { type: "field", name: key };
}

export const METRICS = FIELDS.flatMap((field) => [
  { key: field.name, hint: field.hint },
  ...(field.isAggregatable
    ? FUNCTION_NAMES.map((name) => ({ key: `${name}(${field.name})`, hint: FUNCTION_HINTS[name] }))
    : []),
]);

export function formatFieldValue(field: FieldDefinition, value: number) {
  if (field.unit === "ms") return latencyText(value);
  if (field.unit === "%") return `${Number(value.toFixed(2))}%`;
  if (field.unit === "d") return `${Math.round(value)} d`;
  return String(Math.round(value));
}

function editDistance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

export function closestMatch(word: string, candidates: string[]) {
  const ranked = candidates
    .map((candidate) => ({ candidate, distance: editDistance(word.toLowerCase(), candidate.toLowerCase()) }))
    .sort((a, b) => a.distance - b.distance);
  const best = ranked[0];
  return best && best.distance <= Math.max(1, Math.floor(word.length / 3)) ? best.candidate : null;
}

type Expectation =
  | { kind: "operand" }
  | { kind: "arg" }
  | { kind: "operator"; field: FieldDefinition }
  | { kind: "value"; field: FieldDefinition }
  | { kind: "connector" }
  | { kind: "none" };

function fieldEndingAt(tokens: Token[], index: number) {
  const token = tokens[index];
  if (token?.type === "field") return findField(token.value);
  const isCall = token?.value === ")" && tokens[index - 3]?.type === "function" && tokens[index - 2]?.value === "(";
  return isCall ? findField(tokens[index - 1].value) : undefined;
}

function expectationAfter(tokens: Token[]): Expectation {
  const last = tokens.at(-1);
  if (!last || last.type === "keyword" || (last.value === "(" && tokens.at(-2)?.type !== "function")) {
    return { kind: "operand" };
  }
  if (last.value === "(") return { kind: "arg" };
  if (last.type === "operator") {
    const field = fieldEndingAt(tokens, tokens.length - 2);
    return field ? { kind: "value", field } : { kind: "none" };
  }
  const field = fieldEndingAt(tokens, tokens.length - 1);
  if (field) return { kind: "operator", field };
  if (last.type === "number" || last.type === "string" || last.value === ")") return { kind: "connector" };
  return { kind: "none" };
}

function operandSuggestions(): Suggestion[] {
  return [
    ...FUNCTION_NAMES.map((name) => ({
      kind: "fn" as const,
      label: name,
      insert: `${name}(`,
      hint: FUNCTION_HINTS[name],
    })),
    ...FIELDS.map((field) => ({
      kind: "field" as const,
      label: field.name,
      insert: `${field.name} `,
      hint: field.hint,
    })),
  ];
}

function valueSuggestions(field: FieldDefinition): Suggestion[] {
  if (field.values) {
    return field.values.map((value) => ({
      kind: "value",
      label: `"${value}"`,
      insert: `"${value}" `,
      hint: field.name,
    }));
  }
  const unit = field.unit ? ` ${field.unit}` : "";
  return [
    { kind: "value", label: String(field.defaultValue), insert: `${field.defaultValue} `, hint: `typical${unit}` },
  ];
}

function itemsFor(expectation: Expectation): Suggestion[] {
  switch (expectation.kind) {
    case "operand":
      return operandSuggestions();
    case "arg":
      return FIELDS.filter((field) => field.isAggregatable).map((field) => ({
        kind: "field",
        label: field.name,
        insert: `${field.name}) `,
        hint: field.hint,
      }));
    case "operator":
      return OPERATORS_BY_TYPE[expectation.field.type].map((op) => ({
        kind: "op",
        label: op,
        insert: `${op} `,
        hint: OPERATOR_HINTS[op],
      }));
    case "value":
      return valueSuggestions(expectation.field);
    case "connector":
      return KEYWORDS.map((word) => ({ kind: "kw", label: word, insert: `${word} `, hint: KEYWORD_HINTS[word] }));
    case "none":
      return [];
  }
}

const WORD_CHAR = /[\w"'%.]/;
const OPERATOR_CHAR = /[<>=!]/;

function wordBounds(text: string, caret: number) {
  const pattern = OPERATOR_CHAR.test(text[caret - 1] ?? "") ? OPERATOR_CHAR : WORD_CHAR;
  let from = caret;
  while (from > 0 && pattern.test(text[from - 1])) from--;
  let to = caret;
  while (to < text.length && pattern.test(text[to])) to++;
  return { from, to };
}

export function suggestions(text: string, caret: number): SuggestionResult {
  const { from, to } = wordBounds(text, caret);
  const prefix = text.slice(from, caret).replace(/["']/g, "").toLowerCase();
  const items = itemsFor(expectationAfter(tokenize(text.slice(0, from))));
  const matching = items.filter((item) => item.label.replace(/"/g, "").toLowerCase().startsWith(prefix));
  return { from, to, items: matching };
}
