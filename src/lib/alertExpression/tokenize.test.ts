import { describe, expect, it } from "vitest";
import { splitNumber, tokenize } from "./tokenize";

function types(text: string) {
  return tokenize(text).map((token) => `${token.type}:${token.value}`);
}

describe("tokenize", () => {
  it("classifies every token kind", () => {
    expect(types('p95(latency) >= 800 and region == "FRA" or x = 1')).toEqual([
      "function:p95",
      "paren:(",
      "field:latency",
      "paren:)",
      "operator:>=",
      "number:800",
      "keyword:and",
      "field:region",
      "operator:==",
      'string:"FRA"',
      "keyword:or",
      "field:x",
      "unknown:=",
      "number:1",
    ]);
  });

  it("records start and end offsets", () => {
    expect(tokenize("  latency > 5").map(({ start, end }) => [start, end])).toEqual([
      [2, 9],
      [10, 11],
      [12, 13],
    ]);
  });

  it("reads numbers with units", () => {
    expect(types("latency > 1.5s")).toEqual(["field:latency", "operator:>", "number:1.5s"]);
    expect(splitNumber("1.5s")).toEqual({ amount: 1.5, unit: "s" });
    expect(splitNumber("800")).toEqual({ amount: 800, unit: "" });
  });

  it("treats keywords case-insensitively", () => {
    expect(types("a AND b")[1]).toBe("keyword:AND");
  });

  it("marks unterminated strings as unknown", () => {
    expect(types('status == "down')).toEqual(["field:status", "operator:==", 'unknown:"down']);
  });

  it("returns no tokens for blank input", () => {
    expect(tokenize("   \n ")).toEqual([]);
  });
});
