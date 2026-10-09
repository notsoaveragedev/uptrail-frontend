import type { ReactNode } from "react";
import { TickMeter } from "@/components/ui/TickMeter";
import { USAGE_FILL, USAGE_LABEL, USAGE_TEXT, usageLevel } from "@/lib/billing";

const TICKS = 40;

type UsageMeterProps = {
  label: string;
  used: number;
  limit: number;
  caption: string;
};

export function UsageMeter({ label, used, limit, caption }: UsageMeterProps) {
  const level = usageLevel(used, limit);

  return (
    <UsageRow
      label={label}
      badge={
        level !== "ok" && (
          <span className={`text-caps font-semibold tracking-widest uppercase ${USAGE_TEXT[level]}`}>
            {USAGE_LABEL[level]}
          </span>
        )
      }
      value={
        <>
          <span className={USAGE_TEXT[level]}>{used}</span>
          <span className="text-subtle"> of {limit}</span>
        </>
      }
      caption={caption}
    >
      <TickMeter
        value={Math.min(TICKS, Math.round((used / limit) * TICKS))}
        total={TICKS}
        fillClassName={USAGE_FILL[level]}
        label={`${label}: ${used} of ${limit}`}
      />
    </UsageRow>
  );
}

type UsageRowProps = {
  label: string;
  value: ReactNode;
  caption: string;
  badge?: ReactNode;
  children?: ReactNode;
};

export function UsageRow({ label, value, caption, badge, children }: UsageRowProps) {
  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <dt className="flex items-center gap-2 font-medium text-ink">
          {label}
          {badge}
        </dt>
        <dd className="font-mono whitespace-nowrap">{value}</dd>
      </div>
      {children}
      <p className="text-xs text-subtle">{caption}</p>
    </div>
  );
}
