import { LuExternalLink } from "react-icons/lu";
import { StatusDot } from "@/components/ui/StatusDot";

export function StatusPageCard() {
  return (
    <div className="rounded-lg border border-line bg-card p-3">
      <span className="text-caps font-semibold tracking-widest text-subtle uppercase">Status page</span>
      <a
        href="https://status.pixelcraft.io"
        target="_blank"
        rel="noreferrer"
        className="mt-1 flex items-center gap-1.5 font-mono text-xs text-ink hover:text-ink"
      >
        status.pixelcraft.io
        <LuExternalLink aria-hidden className="size-3 text-subtle" />
      </a>
      <span className="mt-1.5 flex items-center gap-1.5 text-xs text-degraded">
        <StatusDot />
        Partial outage
      </span>
    </div>
  );
}
