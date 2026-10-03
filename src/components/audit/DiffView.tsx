import { Segmented } from "antd";
import { useState } from "react";
import { auditDiff, formatAuditValue, isSameValue } from "@/lib/audit";
import type { AuditEvent } from "@/types/audit";

type DiffMode = "changes" | "json";

export function DiffView({ event }: { event: AuditEvent }) {
  const [mode, setMode] = useState<DiffMode>("changes");
  const rows = auditDiff(event).filter((row) => !isSameValue(row.before, row.after));

  return (
    <div className="flex flex-col gap-3">
      <Segmented
        size="small"
        aria-label="Diff format"
        value={mode}
        onChange={setMode}
        options={[
          { value: "changes", label: "Changes" },
          { value: "json", label: "Raw JSON" },
        ]}
        className="w-fit"
      />
      {mode === "json" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <JsonBlock label="Before" value={event.before} />
          <JsonBlock label="After" value={event.after} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted">No field values changed.</p>
      ) : (
        <dl className="flex flex-col divide-y divide-line rounded-md border border-line">
          {rows.map((row) => (
            <div key={row.field} className="flex flex-col gap-1.5 px-3 py-2.5">
              <dt className="font-mono text-xs text-subtle">{row.field}</dt>
              <dd className="flex flex-col gap-1 font-mono text-xs">
                {row.before !== undefined && (
                  <span className="rounded-sm bg-down-soft px-1.5 py-0.5 text-down">
                    − {formatAuditValue(row.before)}
                  </span>
                )}
                {row.after !== undefined && (
                  <span className="rounded-sm bg-up-soft px-1.5 py-0.5 text-up">+ {formatAuditValue(row.after)}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function JsonBlock({ label, value }: { label: string; value: AuditEvent["before"] }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-subtle">{label}</span>
      <pre className="overflow-x-auto rounded-md border border-line bg-panel p-2.5 font-mono text-xs text-muted">
        {value ? JSON.stringify(value, null, 2) : "null"}
      </pre>
    </div>
  );
}
