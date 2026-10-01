import { Segmented } from "antd";
import { useDeferredValue, useMemo, useState } from "react";
import { LuLock, LuMonitor, LuSmartphone } from "react-icons/lu";
import { StatusPageView } from "@/components/public-status/StatusPageView";
import { pageAddress } from "@/lib/statusPages";
import { buildStatusSnapshot } from "@/mocks/statusSnapshot";
import type { Incident } from "@/types/incident";
import type { Monitor } from "@/types/monitor";
import type { StatusPage } from "@/types/statusPage";

type Viewport = "desktop" | "mobile";

type PreviewPaneProps = {
  page: StatusPage;
  monitors: Monitor[];
  incidents: Incident[];
};

const VIEWPORT_OPTIONS = [
  { value: "desktop" as const, label: "Desktop", icon: <LuMonitor aria-hidden /> },
  { value: "mobile" as const, label: "Mobile", icon: <LuSmartphone aria-hidden /> },
];

export function PreviewPane({ page, monitors, incidents }: PreviewPaneProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const deferredPage = useDeferredValue(page);
  const snapshot = useMemo(
    () => buildStatusSnapshot(deferredPage, monitors, incidents),
    [deferredPage, monitors, incidents],
  );

  return (
    <section
      aria-label="Live preview"
      className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-line bg-panel"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <span className="text-caps font-semibold tracking-wider text-subtle uppercase">Preview</span>
        <Segmented<Viewport> size="small" value={viewport} onChange={setViewport} options={VIEWPORT_OPTIONS} />
      </header>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-4">
        <div
          className={`flex h-fit w-full flex-col overflow-hidden rounded-lg border border-line-strong bg-card ${viewport === "mobile" ? "max-w-97.5" : ""}`}
        >
          <BrowserBar address={pageAddress(page)} />
          <StatusPageView snapshot={{ ...snapshot, theme: page.theme }} isPreview viewport={viewport} />
        </div>
      </div>
    </section>
  );
}

function BrowserBar({ address }: { address: string }) {
  return (
    <div aria-hidden className="flex items-center gap-3 border-b border-line bg-panel px-3 py-2">
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
        <span className="size-2.5 rounded-full bg-line-strong" />
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-md bg-hover px-2 py-0.5 font-mono text-xs text-muted">
        <LuLock className="size-3 shrink-0" />
        {address}
      </span>
    </div>
  );
}
