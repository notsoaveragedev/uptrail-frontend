import { LuGauge, LuShieldCheck, LuSiren } from "react-icons/lu";
import { Sparkline } from "@/components/charts/Sparkline";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { BoardRow } from "@/components/monitors/BoardRow";
import { DeltaPill, KpiCard } from "@/components/overview/KpiCard";
import { MetaList } from "@/components/ui/MetaList";
import { StatusDot } from "@/components/ui/StatusDot";
import { TickMeter } from "@/components/ui/TickMeter";
import { useHeroStory } from "@/hooks/useHeroStory";
import { HERO_LATENCY, heroBoard, type StoryPhase } from "@/lib/landing";

const SUMMARY =
  "Example Uptrail overview with five monitors checked every 30 seconds. When Checkout API goes down, Uptrail opens an incident and alerts the on-call engineer.";

export function HeroConsole() {
  const { step, phase } = useHeroStory();
  const isDown = phase === "down";

  return (
    <div className="relative min-w-0">
      <p className="sr-only">{SUMMARY}</p>
      <div aria-hidden className="overflow-hidden rounded-xl border border-line bg-card xl:w-[calc(50vw-4rem)]">
        <ConsoleBar />
        <MetaList className="px-5 pt-4 font-mono text-xs text-muted">
          <span className="text-up">{isDown ? "99.94" : "99.98"}% uptime</span>
          <span className="text-ink">214 ms p95</span>
          {isDown ? <span className="text-down">1 down</span> : <span>5 up</span>}
          <span className={isDown ? "text-down" : ""}>{isDown ? "1 open incident" : "0 open incidents"}</span>
        </MetaList>
        <div className="hidden grid-cols-3 gap-3 px-5 pt-4 sm:grid">
          <KpiCard
            icon={LuShieldCheck}
            label="Uptime 24h"
            value={isDown ? "99.94" : "99.98"}
            unit="%"
            visual={<TickMeter value={18} total={20} fillClassName="bg-accent" label="Uptime against SLO" />}
            caption="vs prev 24h"
            pill={<DeltaPill tone="good">▲ 0.02</DeltaPill>}
          />
          <KpiCard
            icon={LuGauge}
            label="p95 latency"
            value="214"
            unit="ms"
            visual={<Sparkline values={HERO_LATENCY} className="text-series-1" />}
            caption="238 ms prev"
            pill={<DeltaPill tone="good">▼ 24 ms</DeltaPill>}
          />
          <KpiCard
            icon={LuSiren}
            label="Open incidents"
            value={isDown ? "1" : "0"}
            caption="MTTR 30d 12m"
            pill={isDown ? <DeltaPill tone="bad">▲ 1</DeltaPill> : <DeltaPill tone="good">All clear</DeltaPill>}
          />
        </div>
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {heroBoard(step).map((monitor) => (
            <BoardRow key={monitor.url} monitor={monitor} isTrailAlwaysVisible />
          ))}
        </ul>
      </div>
      <IncidentToast phase={phase} />
    </div>
  );
}

function ConsoleBar() {
  return (
    <div className="flex h-10 items-center gap-3 border-b border-line px-4 font-mono text-xs text-subtle">
      <span>shopnest</span>
      <span className="text-faint">/</span>
      <span>production</span>
      <span className="text-faint">/</span>
      <span className="text-ink">Overview</span>
      <span className="ml-auto flex items-center gap-2 text-up">
        <StatusDot className="motion-safe:animate-pulse" />
        Live
      </span>
      <span className="kbd hidden sm:inline-flex">⌘K</span>
    </div>
  );
}

function IncidentToast({ phase }: { phase: StoryPhase }) {
  const isResolved = phase === "resolved";

  return (
    <div
      aria-hidden
      className={`mt-4 flex w-full max-w-80 flex-col gap-2 rounded-lg border border-line bg-card p-4 shadow-overlay transition duration-500 xl:absolute xl:-bottom-6 xl:-left-10 xl:mt-0 ${
        phase === "healthy" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <IncidentStatusPill status={isResolved ? "resolved" : "investigating"} />
      <p className="text-md font-semibold">{isResolved ? "Checkout API recovered" : "#142 Checkout API is down"}</p>
      <p className="text-muted">{isResolved ? "Down for 1m 32s. Back to 212 ms." : "503 from BOM and FRA"}</p>
      <p className="font-mono text-xs text-subtle">
        {isResolved ? "14:03:41 · status page updated" : "14:02:09 · Email on-call · Slack #ops"}
      </p>
    </div>
  );
}
