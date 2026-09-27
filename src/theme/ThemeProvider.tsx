import { App as AntApp, ConfigProvider } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getAntdTheme } from "./antdTheme";
import { THEME_STORAGE_KEY, ThemeContext } from "./ThemeContext";
import type { ThemeMode } from "./palette";

// index.html sets data-theme before the first paint, so React starts from the same mode.
function readInitialMode(): ThemeMode {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Storage can be blocked (private mode); the theme still applies for this session.
    }
  }, [mode]);

  const value = useMemo(() => {
    function toggleMode() {
      const next = mode === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      setMode(next);
    }
    return { mode, toggleMode };
  }, [mode]);
  const antdTheme = useMemo(() => getAntdTheme(mode), [mode]);

  return (
    <ThemeContext value={value}>
      <ConfigProvider theme={antdTheme} modal={{ centered: true }}>
        <AntApp notification={{ placement: "bottomRight", maxCount: 3, stack: { threshold: 3 } }}>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext>
  );
}
