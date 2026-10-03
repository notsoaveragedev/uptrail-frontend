import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useState } from "react";
import { LuDownload, LuScrollText } from "react-icons/lu";
import { useParams } from "react-router";
import { auditLogQuery } from "@/api/auditLog";
import { AuditEventDrawer } from "@/components/audit/AuditEventDrawer";
import { AuditTable } from "@/components/audit/AuditTable";
import { AuditToolbar } from "@/components/audit/AuditToolbar";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useFilterParams } from "@/hooks/useFilterParams";
import { useNow } from "@/hooks/useNow";
import { useToast } from "@/hooks/useToast";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { AUDIT_FILTER_KEYS, auditCsv, filterAuditEvents, readAuditFilters } from "@/lib/audit";
import { startOfDay } from "@/lib/dates";
import { isTypingTarget } from "@/lib/dom";
import { downloadBlob } from "@/lib/download";
import type { AuditEvent } from "@/types/audit";

export function AuditLogPage() {
  const { orgSlug = "" } = useParams();
  const { data: events } = useQuery(auditLogQuery(orgSlug));

  return (
    <>
      <title>Audit log · Settings · Uptrail</title>
      {events ? (
        <AuditLogView events={events} />
      ) : (
        <>
          <PageHeader level={2} title="Audit log" />
          <TableSkeleton columns={["w-28", "w-32", "w-28", "flex-1", "w-16", "w-20"]} rows={10} />
        </>
      )}
    </>
  );
}

function AuditLogView({ events }: { events: AuditEvent[] }) {
  const toast = useToast();
  const now = useNow(60_000);
  const { filters, hasFilters, setParam, clear } = useFilterParams(AUDIT_FILTER_KEYS, readAuditFilters);
  const [activeId, setActiveId] = useState<string | null>(null);
  const visible = filterAuditEvents(events, filters, now);
  const activeIndex = visible.findIndex((event) => event.id === activeId);
  const today = events.filter((event) => event.at >= startOfDay(now)).length;

  function step(offset: number) {
    const next = visible[activeIndex + offset];
    if (next) setActiveId(next.id);
  }

  useWindowKeydown((event) => {
    if (activeId === null || isTypingTarget(event.target)) return;
    if (event.key === "j" || event.key === "ArrowDown") step(1);
    else if (event.key === "k" || event.key === "ArrowUp") step(-1);
    else return;
    event.preventDefault();
  });

  function exportCsv() {
    downloadBlob(new Blob([auditCsv(visible)], { type: "text/csv" }), `uptrail-audit-log-${filters.range}.csv`);
    toast.success("Audit log exported", `${visible.length.toLocaleString()} events`);
  }

  return (
    <>
      <PageHeader
        level={2}
        title="Audit log"
        meta={
          <MetaList>
            <span>
              <span className="font-mono text-ink">{visible.length.toLocaleString()}</span> events in {filters.range}
            </span>
            <span>
              <span className="font-mono text-ink">{today}</span> today
            </span>
            <span>append-only · kept for 1 year</span>
          </MetaList>
        }
        actions={
          <Button icon={<LuDownload />} disabled={visible.length === 0} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />
      <div className="flex flex-col gap-3">
        <AuditToolbar events={events} filters={filters} hasFilters={hasFilters} setParam={setParam} onClear={clear} />
        <SectionErrorBoundary>
          <AuditTable
            events={visible}
            activeId={activeId}
            onOpen={setActiveId}
            emptyText={
              <EmptyState
                icon={<LuScrollText />}
                title="No events match these filters"
                onClear={hasFilters ? clear : undefined}
              />
            }
          />
        </SectionErrorBoundary>
      </div>
      <AuditEventDrawer event={visible[activeIndex]} onClose={() => setActiveId(null)} onStep={step} />
    </>
  );
}
