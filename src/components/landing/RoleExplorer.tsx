import { Segmented, Tooltip } from "antd";
import { useState } from "react";
import { LuCheck, LuLock } from "react-icons/lu";
import { AUDIT_LINES, ROLE_MATRIX, ROLES, type LandingRole } from "@/lib/landing";

export function RoleExplorer() {
  const [role, setRole] = useState<LandingRole>("Editor");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-3">
        <Segmented aria-label="Role" block value={role} onChange={setRole} options={[...ROLES]} />
        <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
          {ROLE_MATRIX.map((row) => {
            const isAllowed = row.grants[role];
            return (
              <li key={row.permission} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className={isAllowed ? "text-ink" : "text-subtle"}>{row.permission}</span>
                {isAllowed ? (
                  <LuCheck aria-label="Allowed" className="size-4 shrink-0 text-ink" />
                ) : (
                  <Tooltip title={row.denied}>
                    <span tabIndex={0} aria-label={`Not allowed. ${row.denied}`} className="rounded-sm text-faint">
                      <LuLock aria-hidden className="size-3.5" />
                    </span>
                  </Tooltip>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <p className="flex h-8 items-center text-caps font-semibold tracking-widest text-subtle uppercase">Audit log</p>
        <ol className="flex flex-col divide-y divide-line rounded-md border border-line bg-panel font-mono text-xs">
          {AUDIT_LINES.map((line) => (
            <li key={line.time} className="flex flex-col gap-1 px-3 py-2.5">
              <span className="flex gap-3">
                <span className="text-subtle">{line.time}</span>
                <span className="text-ink">{line.action}</span>
              </span>
              <span className="truncate text-muted">
                {line.actor} <span className="text-subtle">{line.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
