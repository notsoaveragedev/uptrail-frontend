import type { ReactNode } from "react";
import { LuCircleCheck, LuCirclePause, LuTriangleAlert } from "react-icons/lu";
import { BOARD_MONITORS, type CheckStatus } from "@/lib/statusBoard";

const CHECK_FILLS: Record<CheckStatus, string> = {
  up: "bg-up",
  degraded: "bg-degraded",
  down: "bg-down",
  paused: "bg-line-strong",
};

const STATUS_ICONS: Record<CheckStatus, ReactNode> = {
  up: <LuCircleCheck className="text-up" />,
  degraded: <LuTriangleAlert className="text-degraded" />,
  down: <LuTriangleAlert className="text-down" />,
  paused: <LuCirclePause className="text-paused" />,
};

export function StatusBoard() {
  return (
    <aside
      aria-hidden
      className="grid-lines hidden flex-col justify-between border-l border-line bg-panel px-12 pt-[12vh] pb-12 lg:flex"
    >
      <div>
        <div className="flex items-center justify-between font-mono text-xs text-subtle">
          <span>Live checks · every 30s</span>
          <span className="flex items-center gap-2 rounded-full border border-line bg-card px-2.5 py-1 text-up">
            <span className="size-1.5 animate-pulse rounded-full bg-up" />
            Live
          </span>
        </div>

        <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-card">
          {BOARD_MONITORS.map((monitor) => (
            <li
              key={monitor.url}
              className={`flex items-center gap-4 px-4 py-3 ${monitor.status === "paused" ? "opacity-60" : ""}`}
            >
              <span className="[&_svg]:size-4">{STATUS_ICONS[monitor.status]}</span>
              <span className="flex w-44 min-w-0 flex-col">
                <span className="truncate font-medium">{monitor.name}</span>
                <span className="truncate font-mono text-xs text-subtle">{monitor.url}</span>
              </span>
              <span className="flex flex-1 justify-center gap-0.5">
                {monitor.checks.map((check, index) => (
                  <span key={index} className={`h-4 w-0.75 rounded-[1px] ${CHECK_FILLS[check]}`} />
                ))}
              </span>
              <span
                className={`w-16 text-right font-mono text-xs ${monitor.status === "degraded" ? "text-degraded" : "text-ink"}`}
              >
                {monitor.latency}
              </span>
              <span className="w-24 text-right font-mono text-xs text-subtle">{monitor.regions}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-12 max-w-md text-lg font-semibold tracking-tight">
        Know it's down <span className="text-accent">before</span> your users do.
      </p>
    </aside>
  );
}
