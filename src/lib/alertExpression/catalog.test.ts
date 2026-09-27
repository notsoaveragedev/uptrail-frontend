import { describe, expect, it } from "vitest";
import { closestMatch, suggestions } from "./catalog";

function labels(text: string, caret = text.length) {
  return suggestions(text, caret).items.map((item) => item.label);
}

describe("suggestions", () => {
  it("offers metrics and functions at the start", () => {
    expect(labels("")).toContain("p95");
    expect(labels("")).toContain("latency");
    expect(labels("lat")).toEqual(["latency"]);
  });

  it("offers aggregatable fields inside a function", () => {
    expect(labels("p95(")).toEqual(["latency"]);
  });

  it("offers operators allowed for the field type", () => {
    expect(labels("status ")).toEqual(["==", "!="]);
    expect(labels("p95(latency) ")).toContain(">=");
  });

  it("offers enum values after an operator", () => {
    expect(labels("status == ")).toEqual(['"up"', '"down"', '"degraded"']);
    expect(labels('status == "d')).toEqual(['"down"', '"degraded"']);
  });

  it("offers connectors after a value", () => {
    expect(labels("latency > 5 ")).toEqual(["and", "or"]);
  });

  it("returns the replacement range of the current word", () => {
    expect(suggestions("latency > 5 and err", 19)).toMatchObject({ from: 16, to: 19 });
  });
});

describe("closestMatch", () => {
  it("finds near misses only", () => {
    expect(closestMatch("lateny", ["latency", "status"])).toBe("latency");
    expect(closestMatch("zzz", ["latency", "status"])).toBeNull();
  });
});
