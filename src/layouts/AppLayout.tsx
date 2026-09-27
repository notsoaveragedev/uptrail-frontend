import { Drawer } from "antd";
import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import { importWithReload } from "@/lib/lazyPage";

const CommandPalette = lazy(() =>
  importWithReload(() => import("@/components/layout/CommandPalette")).then((module) => ({
    default: module.CommandPalette,
  })),
);

export function AppLayout() {
  const { pathname } = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleSearch() {
    setHasOpenedSearch(true);
    setIsSearchOpen((open) => !open);
  }

  useSearchShortcut(toggleSearch);

  useEffect(() => {
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex h-dvh bg-canvas">
      <aside className="hidden w-60 shrink-0 border-r border-line lg:block">
        <SectionErrorBoundary>
          <Sidebar />
        </SectionErrorBoundary>
      </aside>

      <Drawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        placement="left"
        size="15rem"
        closable={false}
        classNames={{ body: "p-0" }}
      >
        <Sidebar onNavigate={() => setIsMenuOpen(false)} />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <SectionErrorBoundary>
          <TopBar onOpenSearch={toggleSearch} onOpenMenu={() => setIsMenuOpen(true)} />
        </SectionErrorBoundary>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-360 px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        {hasOpenedSearch && <CommandPalette open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
      </Suspense>
    </div>
  );
}
