import { describe, expect, it } from "vitest";
import { ALERT_RULES } from "@/mocks/alerts";
import type { ExpressionNode } from "@/types/alerts";
import { parse } from "./parse";

function ast(text: string): ExpressionNode {
  const result = parse(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.ast;
}

function error(text: string) {
  const result = parse(text);
  if (result.ok) throw new Error(`Expected "${text}" to fail`);
  return result.error;
}

function shape(node: ExpressionNode): unknown {
  if (node.type === "compare") return node.left.type === "fn" ? node.left.name : node.left.name;
  return { [node.type]: node.children.map(shape) };
}

describe("parse", () => {
  it("builds the spec AST", () => {
    expect(ast('p95(latency) > 800 and region == "FRA"')).toEqual({
      type: "and",
      children: [
        { type: "compare", op: ">", left: { type: "fn", name: "p95", arg: "latency" }, right: 800 },
        { type: "compare", op: "==", left: { type: "field", name: "region" }, right: "FRA" },
      ],
    });
  });

  it("parses every seed rule", () => {
    for (const rule of ALERT_RULES) expect(parse(rule.expression).ok, rule.expression).toBe(true);
  });

  it("binds and tighter than or", () => {
    expect(shape(ast("latency > 1 or error_rate > 2 and status_code > 3"))).toEqual({
      or: ["latency", { and: ["error_rate", "status_code"] }],
    });
    expect(shape(ast("latency > 1 and error_rate > 2 or status_code > 3"))).toEqual({
      or: [{ and: ["latency", "error_rate"] }, "status_code"],
    });
  });

  it("respects parentheses", () => {
    expect(shape(ast("latency > 1 and (error_rate > 2 or status_code > 3)"))).toEqual({
      and: ["latency", { or: ["error_rate", "status_code"] }],
    });
  });

  it("flattens chains of the same operator", () => {
    expect(shape(ast("(latency > 1 or error_rate > 2) or status_code > 3"))).toEqual({
      or: ["latency", "error_rate", "status_code"],
    });
  });

  it("converts units to base units", () => {
    expect(ast("latency > 1.5s")).toMatchObject({ right: 1500 });
    expect(ast("error_rate > 2%")).toMatchObject({ right: 2 });
  });

  it("points at a missing value", () => {
    expect(error("p95(latency) > ")).toMatchObject({
      message: "Expected a value after '>' at column 16",
      start: 15,
      end: 15,
      line: 1,
      column: 16,
    });
  });

  it("suggests the closest field", () => {
    expect(error("lateny > 800")).toMatchObject({
      message: 'Unknown field "lateny". Did you mean "latency"?',
      start: 0,
      end: 6,
    });
  });

  it("suggests the closest function", () => {
    expect(error("p96(latency) > 800").message).toBe('Unknown function "p96". Did you mean "p95"?');
  });

  it("type-checks values", () => {
    expect(error('latency > "fast"')).toMatchObject({
      message: "latency expects a number, not a string",
      start: 10,
      end: 16,
    });
    expect(error('status == "dwn"').message).toBe('Unknown status "dwn". Did you mean "down"?');
    expect(error('region == "XYZ"').message).toBe('region must be "BOM", "FRA", "IAD", "SIN" or "SFO"');
    expect(error("status == 5").message).toBe('status expects "up", "down" or "degraded"');
    expect(error('status > "down"').message).toBe("status can only be compared with == or !=");
    expect(error("latency > 5d").message).toBe('Unknown unit "d" for latency. Use ms or s');
    expect(error("p95(error_rate) > 5").message).toBe("p95() only works with latency");
  });

  it("explains structural mistakes", () => {
    expect(error("").message).toBe("Write a condition, like p95(latency) > 800");
    expect(error("latency = 5").message).toBe("Use '==' to compare, not '='");
    expect(error("latency 5").message).toBe("Expected an operator after latency, like > or ==");
    expect(error("latency > 5 and").message).toBe("Expected a condition after 'and' at column 16");
    expect(error("(latency > 5").message).toBe("Expected ')' to close the '(' at column 1");
    expect(error("latency > 5)").message).toBe("Unexpected ')' with no matching '('");
    expect(error("latency > 5 error_rate > 1")).toMatchObject({
      message: "Expected 'and' or 'or' before 'error_rate'",
      start: 12,
    });
    expect(error('status == "down" for 2m').message).toBe("Set the duration in the For field, not in the expression");
    expect(error('status == "down').message).toBe("Missing closing quote");
  });

  it("reports line and column on multi-line input", () => {
    expect(error("latency > 5 and\n  lateny > 3")).toMatchObject({ line: 2, column: 3 });
  });
});
