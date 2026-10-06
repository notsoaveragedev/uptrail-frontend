import { CheckTrail } from "@/components/monitors/CheckTrail";
import { StatusIcon } from "@/components/monitors/StatusIcon";
import { REGION_CHECKS } from "@/lib/landing";

export function RegionVerdict() {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
        {REGION_CHECKS.map((region) => (
          <li key={region.code} className="flex items-center gap-3 px-3 py-2.5">
            <span className="w-8 font-mono text-xs text-ink">{region.code}</span>
            <span className="hidden w-18 text-xs text-subtle sm:block">{region.city}</span>
            <span className="flex min-w-0 flex-1 justify-end overflow-hidden" aria-hidden>
              <CheckTrail checks={region.checks} />
            </span>
            <span className="w-14 text-right font-mono text-xs text-muted">{region.latency}</span>
          </li>
        ))}
      </ul>
      <p className="flex items-start gap-2 text-xs text-muted">
        <StatusIcon status="up" className="mt-0.5 size-3.5" />
        FRA failed once at 14:01. No other region agreed, so nobody was paged.
      </p>
    </div>
  );
}
