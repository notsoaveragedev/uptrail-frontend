import type { ReactNode } from "react";
import { DEFAULT_STATUS_THEME } from "@/lib/publicStatus";
import type { StatusTheme } from "@/types/statusPage";
import { StatusThemeScope } from "./StatusThemeScope";

type PublicShellProps = {
  theme?: StatusTheme;
  children: ReactNode;
};

export function PublicShell({ theme = DEFAULT_STATUS_THEME, children }: PublicShellProps) {
  return (
    <StatusThemeScope theme={theme} className="min-h-dvh">
      <main className="mx-auto flex w-full max-w-180 flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </StatusThemeScope>
  );
}
