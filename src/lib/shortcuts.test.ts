import { describe, expect, it } from "vitest";
import { goToTarget, shortcutGroups } from "./shortcuts";

describe("goToTarget", () => {
  it("finds the section for a go-to key", () => {
    expect(goToTarget("m", new Set())?.path).toBe("monitors");
  });

  it("skips sections the role can't see", () => {
    expect(goToTarget("p", new Set())).toBeUndefined();
    expect(goToTarget("p", new Set(["project:read"]))?.path).toBe("projects");
  });

  it("returns nothing for unknown keys", () => {
    expect(goToTarget("z", new Set(["*"]))).toBeUndefined();
  });
});

describe("shortcutGroups", () => {
  it("lists create monitor only with the permission", () => {
    const labels = (granted: Set<string>) =>
      shortcutGroups(granted).flatMap((group) => group.shortcuts.map((s) => s.label));
    expect(labels(new Set())).not.toContain("Create monitor");
    expect(labels(new Set(["monitor:create"]))).toContain("Create monitor");
  });
});
