import { describe, expect, it } from "vitest";
import { ALERT_RULES } from "@/mocks/alerts";
import type { ExpressionNode } from "@/types/alerts";
import { parse } from "./parse";
import { print } from "./print";

function ast(text: string): ExpressionNode {
  const result = parse(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.ast;
}

const CASES = [
  ...ALERT_RULES.map((rule) => rule.expression),
  "latency > 1 and (error_rate > 2 or status_code >= 500)",
  '(latency > 1 or error_rate > 2) and (status_code > 3 or region != "BOM")',
  "((latency > 1))",
  'latency>1.5s AND status=="down"',
  "a_b",
].filter((text) => parse(text).ok);

describe("print", () => {
  it("round-trips every case", () => {
    for (const text of CASES) expect(ast(print(ast(text))), text).toEqual(ast(text));
  });

  it("prints canonical text with minimal parentheses", () => {
    expect(print(ast("((latency > 1))"))).toBe("latency > 1");
    expect(print(ast('latency>1.5s AND status=="down"'))).toBe('latency > 1500 and status == "down"');
    expect(print(ast("(latency > 1 and error_rate > 2) or status_code > 3"))).toBe(
      "latency > 1 and error_rate > 2 or status_code > 3",
    );
    expect(print(ast("latency > 1 and (error_rate > 2 or status_code > 3)"))).toBe(
      "latency > 1 and (error_rate > 2 or status_code > 3)",
    );
  });

  it("is stable when printed twice", () => {
    for (const text of CASES) expect(print(ast(print(ast(text))))).toBe(print(ast(text)));
  });
});
