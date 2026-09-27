import { Tag } from "antd";
import { LuExternalLink } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { useNow } from "@/hooks/useNow";
import { formatSince } from "@/lib/monitorDetail";
import { displayUrl, formatInterval, MONITOR_TYPE_LABELS } from "@/lib/monitors";
import { STATUS_LABELS } from "@/lib/status";
import type { Monitor } from "@/types/monitor";
import { MonitorActions } from "./MonitorActions";

export function MonitorHeader({ monitor }: { monitor: Monitor }) {
  const { orgSlug } = useParams();
  const now = useNow(30_000);
  const since = formatSince(now - monitor.statusSince);

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link to={`/o/${orgSlug}/monitors`}>Monitors</Link>
        <span aria-hidden className="text-faint">
          /
        </span>
        <span aria-current="page" className="truncate text-ink">
          {monitor.name}
        </span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={monitor.status} label={`${STATUS_LABELS[monitor.status]} · for ${since}`} />
            <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight outline-none">
              {monitor.name}
            </h1>
          </div>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs"
            >
              {displayUrl(monitor.url)}
              <LuExternalLink aria-hidden className="size-3" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <Dot />
            <span>
              {MONITOR_TYPE_LABELS[monitor.type]} · {monitor.method} · every {formatInterval(monitor.intervalSec)} ·{" "}
              {monitor.regions.length} regions
            </span>
            <Dot />
            <span className="capitalize">{monitor.project}</span>
            {monitor.tags.map((tag) => (
              <Tag key={tag} className="m-0 font-mono text-xs">
                {tag}
              </Tag>
            ))}
          </p>
        </div>
        <MonitorActions monitor={monitor} />
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span aria-hidden className="text-faint">
      ·
    </span>
  );
}
