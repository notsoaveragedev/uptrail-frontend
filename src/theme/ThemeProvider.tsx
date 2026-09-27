import { App as AntApp, ConfigProvider } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader } from "@/components/ui/Loader";
import { writeJson } from "@/lib/storage";
import { getAntdTheme } from "./antdTheme";
import { THEME_STORAGE_KEY, ThemeContext } from "./ThemeContext";
import type { ThemeMode } from "./palette";

function readInitialMode(): ThemeMode {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readInitialMode);

  useEffect(() => {
    writeJson(THEME_STORAGE_KEY, mode);
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
      <ConfigProvider
        theme={antdTheme}
        modal={{ centered: true }}
        spin={{
          indicator: (
            <span>
              <Loader />
            </span>
          ),
        }}
        button={{ loadingIcon: <Loader size="sm" className="text-current" /> }}
      >
        <AntApp notification={{ placement: "bottomRight", maxCount: 3, stack: { threshold: 3 } }}>{children}</AntApp>
      </ConfigProvider>
    </ThemeContext>
  );
}
