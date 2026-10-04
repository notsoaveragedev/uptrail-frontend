import { createContext, useContext } from "react";
import type { ThemeMode } from "./palette";

export const THEME_STORAGE_KEY = "uptrail:theme";

export type ThemePreference = ThemeMode | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  preference: ThemePreference;
  toggleMode: () => void;
  setPreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeMode must be used inside ThemeProvider");
  return context;
}
