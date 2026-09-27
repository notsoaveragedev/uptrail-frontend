import { TIMING_PHASES } from "@/lib/timing";
import type { Timings } from "@/types/logs";
import { DrawerSection } from "./DrawerSection";

function phaseBars(timings: Timings) {
  let offset = 0;
  return TIMING_PHASES.map((phase) => {
    const bar = { ...phase, start: offset, duration: timings[phase.key] };
    offset += bar.duration;
    return bar;
  });
}

export function TimingWaterfall({ timings }: { timings: Timings }) {
  const bars = phaseBars(timings);
  const total = bars.reduce((sum, bar) => sum + bar.duration, 0);

  return (
    <DrawerSection
      title="Timing"
      extra={
        <span className="font-mono text-xs">
          {total.toLocaleString()} <span className="text-subtle">ms total</span>
        </span>
      }
    >
      <ol className="flex flex-col gap-1.5">
        {bars.map((bar) => (
          <li key={bar.key} className="grid grid-cols-[4.5rem_1fr_4rem] items-center gap-3 text-xs">
            <span className="text-muted">{bar.label}</span>
            <span className="relative h-2 rounded-sm bg-hover">
              <span
                className={`absolute inset-y-0 min-w-0.5 rounded-sm ${bar.fill}`}
                style={{ left: `${(bar.start / total) * 100}%`, width: `${(bar.duration / total) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono">
              {bar.duration.toLocaleString()}
              <span className="ml-0.5 text-subtle">ms</span>
            </span>
          </li>
        ))}
      </ol>
      <div aria-hidden className="mr-[4.75rem] ml-[5.25rem] flex justify-between font-mono text-caps text-faint">
        <span>0</span>
        <span>{Math.round(total / 2).toLocaleString()}</span>
        <span>{total.toLocaleString()} ms</span>
      </div>
    </DrawerSection>
  );
}
