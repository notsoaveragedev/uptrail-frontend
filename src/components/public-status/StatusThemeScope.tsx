import { ConfigProvider, type ThemeConfig } from "antd";
import { useMemo, useRef, type ReactNode } from "react";
import { resolveStatusTheme, themeVariables } from "@/lib/statusTheme";
import { getAntdTheme } from "@/theme/antdTheme";
import type { StatusTheme } from "@/types/statusPage";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type StatusThemeScopeProps = {
  theme: StatusTheme;
  className?: string;
  children: ReactNode;
};

function brandTheme(scheme: "light" | "dark", primary: string, onPrimary: string): ThemeConfig {
  const base = getAntdTheme(scheme);
  return {
    ...base,
    token: { ...base.token, colorPrimary: primary, colorLink: primary, colorPrimaryHover: primary },
    components: { ...base.components, Button: { ...base.components?.Button, primaryColor: onPrimary } },
  };
}

export function StatusThemeScope({ theme, className = "", children }: StatusThemeScopeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const { scheme, primary, onPrimary } = resolveStatusTheme(theme, prefersDark);
  const antdTheme = useMemo(() => brandTheme(scheme, primary, onPrimary), [scheme, primary, onPrimary]);

  return (
    <div
      ref={rootRef}
      data-theme={scheme}
      style={themeVariables(theme, prefersDark)}
      className={`relative bg-canvas font-sans text-sm text-ink ${className}`}
    >
      <ConfigProvider theme={antdTheme} getPopupContainer={() => rootRef.current ?? document.body}>
        {children}
      </ConfigProvider>
    </div>
  );
}
