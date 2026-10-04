import { App as AntApp, ConfigProvider } from "antd";
import { useEffect, useMemo, type ReactNode } from "react";
import { Loader } from "@/components/ui/Loader";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStoredState } from "@/hooks/useStoredState";
import { readJson } from "@/lib/storage";
import { getAntdTheme } from "./antdTheme";
import { THEME_STORAGE_KEY, ThemeContext, type ThemePreference } from "./ThemeContext";
import type { ThemeMode } from "./palette";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

function readPreference(): ThemePreference {
  const stored = readJson<string>(THEME_STORAGE_KEY, "dark");
  return stored === "light" || stored === "system" ? stored : "dark";
}

function resolve(preference: ThemePreference, prefersLight: boolean): ThemeMode {
  if (preference !== "system") return preference;
  return prefersLight ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setStoredPreference] = useStoredState(THEME_STORAGE_KEY, readPreference());
  const prefersLight = useMediaQuery(LIGHT_QUERY);
  const mode = resolve(preference, prefersLight);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const value = useMemo(() => {
    function setPreference(next: ThemePreference) {
      document.documentElement.dataset.theme = resolve(next, prefersLight);
      setStoredPreference(next);
    }
    return { mode, preference, setPreference, toggleMode: () => setPreference(mode === "dark" ? "light" : "dark") };
  }, [mode, preference, prefersLight, setStoredPreference]);
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
