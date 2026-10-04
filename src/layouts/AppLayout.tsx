import { Drawer } from "antd";
import { Suspense, useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useLazyDisclosure } from "@/hooks/useLazyDisclosure";
import { useRouteFocus } from "@/hooks/useRouteFocus";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";
import { rememberOrg } from "@/lib/currentOrg";
import { lazyComponent } from "@/lib/lazyPage";

const CommandPalette = lazyComponent(() => import("@/components/layout/CommandPalette"), "CommandPalette");

export function AppLayout() {
  const { orgSlug = "" } = useParams();
  const search = useLazyDisclosure();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useSearchShortcut(search.toggle);

  useRouteFocus();

  useEffect(() => rememberOrg(orgSlug), [orgSlug]);

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
          <TopBar onOpenSearch={search.toggle} onOpenMenu={() => setIsMenuOpen(true)} />
        </SectionErrorBoundary>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-360 px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        {search.hasOpened && <CommandPalette open={search.isOpen} onClose={search.close} />}
      </Suspense>
    </div>
  );
}
