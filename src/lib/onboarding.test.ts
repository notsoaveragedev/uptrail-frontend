import { describe, expect, it } from "vitest";
import { advance, complete, emptyDraft, isIncluded, monitorNameFromUrl, skip } from "./onboarding";

describe("onboarding", () => {
  it("names a monitor from its URL", () => {
    expect(monitorNameFromUrl("https://api.acme.com/health")).toBe("Acme API");
    expect(monitorNameFromUrl("https://www.northwind-shop.io")).toBe("Northwind Shop");
    expect(monitorNameFromUrl("not a url")).toBe("");
  });

  it("remembers the furthest step reached", () => {
    const draft = advance(advance(emptyDraft("a@b.co"), 3), 1);
    expect(draft).toMatchObject({ step: 1, furthest: 3 });
  });

  it("tracks skipped steps and un-skips them when completed later", () => {
    const skipped = skip(advance(emptyDraft("a@b.co"), 2), "monitor");
    expect(isIncluded(skipped, "monitor")).toBe(false);
    expect(skipped.step).toBe(3);
    const redone = complete({ ...skipped, step: 2 }, "monitor");
    expect(isIncluded(redone, "monitor")).toBe(true);
  });
});
