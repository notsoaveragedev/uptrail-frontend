import { BoardRow } from "@/components/monitors/BoardRow";
import { StatusDot } from "@/components/ui/StatusDot";
import { BOARD_MONITORS } from "@/lib/statusBoard";

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
            <StatusDot className="animate-pulse" />
            Live
          </span>
        </div>

        <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-card">
          {BOARD_MONITORS.map((monitor) => (
            <BoardRow key={monitor.url} monitor={monitor} />
          ))}
        </ul>
      </div>

      <p className="mt-12 max-w-md text-lg font-semibold tracking-tight">
        Know it's down <span className="text-accent">before</span> your users do.
      </p>
    </aside>
  );
}
