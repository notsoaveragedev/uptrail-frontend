import type { CSSProperties } from "react";
import { palettes } from "@/theme/palette";
import type { OverallStatus, StatusTheme } from "@/types/statusPage";
import type { Tone } from "./status";

export type ColorScheme = "light" | "dark";

type Rgb = [number, number, number];

export const MIN_TEXT_CONTRAST = 4.5;
export const MIN_PRIMARY_CONTRAST = 3;

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const MID_LUMINANCE = 0.179;

export const OVERALL_STATUS_LABELS: Record<OverallStatus, string> = {
  operational: "All systems operational",
  degraded: "Degraded performance",
  partial_outage: "Partial outage",
  major_outage: "Major outage",
  maintenance: "Under maintenance",
};

export const OVERALL_STATUS_SHORT_LABELS: Record<OverallStatus, string> = {
  operational: "operational",
  degraded: "degraded",
  partial_outage: "partial outage",
  major_outage: "major outage",
  maintenance: "maintenance",
};

export const OVERALL_STATUS_TONE: Record<OverallStatus, Tone> = {
  operational: "up",
  degraded: "degraded",
  partial_outage: "down",
  major_outage: "down",
  maintenance: "info",
};

function parseHex(color: string): Rgb | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  const hex = match[1].length === 3 ? [...match[1]].map((char) => char + char).join("") : match[1];
  return [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16)) as Rgb;
}

function toHex(rgb: Rgb) {
  return `#${rgb.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function channelLuminance(value: number) {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance([red, green, blue]: Rgb) {
  return 0.2126 * channelLuminance(red) + 0.7152 * channelLuminance(green) + 0.0722 * channelLuminance(blue);
}

function ratio(a: Rgb, b: Rgb) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

function mix(from: Rgb, to: Rgb, amount: number): Rgb {
  return from.map((value, index) => value + (to[index] - value) * amount) as Rgb;
}

export function isHexColor(color: string) {
  return parseHex(color) !== null;
}

export function isDarkColor(color: string) {
  const rgb = parseHex(color);
  return rgb !== null && luminance(rgb) < MID_LUMINANCE;
}

export function contrastRatio(a: string, b: string) {
  const first = parseHex(a);
  const second = parseHex(b);
  return first && second ? ratio(first, second) : 1;
}

export function suggestReadable(color: string, background: string, minRatio = MIN_TEXT_CONTRAST) {
  const rgb = parseHex(color) ?? BLACK;
  const backdrop = parseHex(background) ?? WHITE;
  if (ratio(rgb, backdrop) >= minRatio) return toHex(rgb);
  const target = luminance(backdrop) > MID_LUMINANCE ? BLACK : WHITE;
  for (let step = 1; step <= 20; step++) {
    const candidate = mix(rgb, target, step / 20);
    if (ratio(candidate, backdrop) >= minRatio) return toHex(candidate);
  }
  return toHex(target);
}

export function resolveScheme(mode: StatusTheme["mode"], prefersDark = false): ColorScheme {
  if (mode === "auto") return prefersDark ? "dark" : "light";
  return mode;
}

export function resolveStatusTheme(theme: StatusTheme, prefersDark = false) {
  const scheme = resolveScheme(theme.mode, prefersDark);
  const defaults = palettes[scheme];
  const fitsScheme = isHexColor(theme.background) && isDarkColor(theme.background) === (scheme === "dark");
  const background = fitsScheme ? theme.background : defaults.canvas;
  const surface = fitsScheme && isHexColor(theme.surface) ? theme.surface : defaults.card;
  const text = fitsScheme && contrastRatio(theme.text, background) >= MIN_TEXT_CONTRAST ? theme.text : defaults.ink;
  const primary = contrastRatio(theme.primary, background) >= MIN_PRIMARY_CONTRAST ? theme.primary : defaults.accent;
  const onPrimary = contrastRatio(primary, "#FFFFFF") >= contrastRatio(primary, "#000000") ? "#FFFFFF" : "#000000";

  return { scheme, background, surface, text, primary, onPrimary };
}

export function themeVariables(theme: StatusTheme, prefersDark = false) {
  const resolved = resolveStatusTheme(theme, prefersDark);
  return {
    "--sp-primary": resolved.primary,
    "--sp-on-primary": resolved.onPrimary,
    "--sp-bg": resolved.background,
    "--sp-surface": resolved.surface,
    "--sp-text": resolved.text,
    "--canvas": "var(--sp-bg)",
    "--card": "var(--sp-surface)",
    "--ink": "var(--sp-text)",
  } as CSSProperties;
}
