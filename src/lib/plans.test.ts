import { describe, expect, it } from "vitest";
import { planHighlights } from "./plans";

describe("planHighlights", () => {
  it("lists the Free plan limits", () => {
    expect(planHighlights("free")).toEqual([
      "20 monitors",
      "1 minute checks",
      "3 members",
      "30 days of history",
      "Every alert channel",
      "A status page per project",
    ]);
  });

  it("lists the Pro plan limits", () => {
    expect(planHighlights("pro")).toEqual([
      "200 monitors",
      "30 second checks",
      "Unlimited members",
      "1 year of history",
      "Custom roles and audit log",
      "Custom status page domain",
    ]);
  });
});
