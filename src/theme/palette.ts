export type ThemeMode = "dark" | "light";

type Palette = {
  canvas: string;
  panel: string;
  card: string;
  hover: string;
  line: string;
  lineStrong: string;
  ink: string;
  muted: string;
  subtle: string;
  faint: string;
  grid: string;
  tooltip: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  onAccent: string;
  up: string;
  down: string;
  degraded: string;
  paused: string;
  maintenance: string;
  mask: string;
  overlayShadow: string;
};

export const palettes: Record<ThemeMode, Palette> = {
  dark: {
    canvas: "#0E0F11",
    panel: "#121316",
    card: "#15161A",
    hover: "#1C1E22",
    line: "#25272C",
    lineStrong: "#373A40",
    ink: "#ECEDEF",
    muted: "#9B9FA7",
    subtle: "#6E727A",
    faint: "#4B4E55",
    grid: "#1F2125",
    tooltip: "#1F2125",
    accent: "#FF7A3D",
    accentHover: "#FF915E",
    accentSoft: "#2A1810",
    onAccent: "#1A0D05",
    up: "#3DD68C",
    down: "#F0485E",
    degraded: "#EBC23F",
    paused: "#8A8F98",
    maintenance: "#7B93C9",
    mask: "rgba(0, 0, 0, 0.6)",
    overlayShadow: "0 0.5rem 1.5rem rgba(0, 0, 0, 0.5)",
  },
  light: {
    canvas: "#F7F7F5",
    panel: "#F1F1EE",
    card: "#FFFFFF",
    hover: "#F4F4F1",
    line: "#E6E6E1",
    lineStrong: "#CFCFC8",
    ink: "#16171A",
    muted: "#5B5F66",
    subtle: "#80848C",
    faint: "#B4B7BD",
    grid: "#EEEEEA",
    tooltip: "#16171A",
    accent: "#C2410C",
    accentHover: "#A8380A",
    accentSoft: "#FDEEE6",
    onAccent: "#FFFFFF",
    up: "#12824C",
    down: "#C8262E",
    degraded: "#A16207",
    paused: "#6B7079",
    maintenance: "#4A64A8",
    mask: "rgba(22, 23, 26, 0.35)",
    overlayShadow: "0 0.5rem 1.5rem rgba(22, 23, 26, 0.1)",
  },
};
