import { describe, expect, it } from "vitest";
import { contrastRatio, resolveStatusTheme, suggestReadable } from "./statusTheme";

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
  });

  it("returns 1 for identical colours", () => {
    expect(contrastRatio("#2563EB", "#2563eb")).toBe(1);
  });

  it("is symmetric", () => {
    expect(contrastRatio("#C2410C", "#FFFFFF")).toBeCloseTo(contrastRatio("#FFFFFF", "#C2410C"), 10);
  });

  it("matches known WCAG values", () => {
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
    expect(contrastRatio("#2563EB", "#FFFFFF")).toBeCloseTo(5.17, 2);
  });

  it("accepts shorthand hex", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
  });

  it("treats invalid colours as failing", () => {
    expect(contrastRatio("tomato", "#FFFFFF")).toBe(1);
  });
});

describe("suggestReadable", () => {
  it("keeps a colour that already passes", () => {
    expect(suggestReadable("#16171A", "#FFFFFF")).toBe("#16171A");
  });

  it("darkens a light colour on a light background until it passes", () => {
    const suggestion = suggestReadable("#FACC15", "#FFFFFF");
    expect(contrastRatio(suggestion, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(suggestion).not.toBe("#000000");
  });

  it("lightens a dark colour on a dark background", () => {
    const suggestion = suggestReadable("#1E3A8A", "#0E0F11");
    expect(contrastRatio(suggestion, "#0E0F11")).toBeGreaterThanOrEqual(4.5);
  });

  it("honours a custom minimum ratio", () => {
    const suggestion = suggestReadable("#93C5FD", "#FFFFFF", 3);
    const ratio = contrastRatio(suggestion, "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(3);
    expect(ratio).toBeLessThan(4.5);
  });
});

describe("resolveStatusTheme", () => {
  const theme = {
    primary: "#2563EB",
    background: "#FFFFFF",
    surface: "#F7F7F5",
    text: "#16171A",
    mode: "light" as const,
  };

  it("keeps brand colours that pass", () => {
    expect(resolveStatusTheme(theme)).toMatchObject({ primary: "#2563EB", text: "#16171A", onPrimary: "#FFFFFF" });
  });

  it("falls back to default tokens when contrast fails", () => {
    const resolved = resolveStatusTheme({ ...theme, primary: "#FDE68A", text: "#D4D4D4" });
    expect(resolved.primary).not.toBe("#FDE68A");
    expect(resolved.text).not.toBe("#D4D4D4");
  });

  it("uses dark defaults for a light brand in auto mode when the viewer prefers dark", () => {
    const resolved = resolveStatusTheme({ ...theme, mode: "auto" }, true);
    expect(resolved.scheme).toBe("dark");
    expect(resolved.background).not.toBe("#FFFFFF");
  });
});
