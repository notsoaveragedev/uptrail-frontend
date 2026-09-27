import { createContext, useContext } from "react";
import type { ThemeMode } from "./palette";

export const THEME_STORAGE_KEY = "uptrail:theme";

type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeMode must be used inside ThemeProvider");
  return context;
}
