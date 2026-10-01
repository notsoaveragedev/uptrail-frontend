import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/format";
import { formatSpan, formatSpanShort } from "@/lib/incidents";
import type { Incident } from "@/types/incident";
import { IncidentDuration } from "./IncidentDuration";

export function KeyTimes({ incident }: { incident: Incident }) {
  const { startedAt, acknowledgedAt, resolvedAt } = incident;

  return (
    <Card title="Key times">
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 px-4 pb-4">
        <Row label="Started">{formatDateTime(startedAt)}</Row>
        <Row label="Acknowledged">
          {acknowledgedAt ? (
            <>
              {formatDateTime(acknowledgedAt)}
              <span className="text-subtle"> ({formatSpanShort(acknowledgedAt - startedAt)})</span>
            </>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Resolved">{resolvedAt ? formatDateTime(resolvedAt) : "—"}</Row>
        <Row label="Time to ack">{acknowledgedAt ? formatSpan(acknowledgedAt - startedAt) : "—"}</Row>
        <Row label={resolvedAt ? "Time to resolve" : "Open for"}>
          <IncidentDuration incident={incident} />
        </Row>
      </dl>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-mono text-xs leading-5 text-ink">{children}</dd>
    </>
  );
}
