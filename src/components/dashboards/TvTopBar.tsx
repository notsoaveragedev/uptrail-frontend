import { Button } from "antd";
import { LuX } from "react-icons/lu";
import { Logo } from "@/components/Logo";
import { StatusDot } from "@/components/ui/StatusDot";
import { TickMeter } from "@/components/ui/TickMeter";
import { useNow } from "@/hooks/useNow";
import { formatClock } from "@/lib/format";
import { useWakeLock } from "./useWakeLock";

const ROTATION_TICKS = 12;

type TvTopBarProps = {
  name: string;
  rotation: { position: number; total: number; rotatedAt: number; everySec: number } | null;
  isIdle: boolean;
  onExit: () => void;
};

export function TvTopBar({ name, rotation, isIdle, onExit }: TvTopBarProps) {
  const now = useNow();

  return (
    <header className="flex items-center gap-4 border-b border-line px-6 py-3">
      <Logo />
      <span aria-hidden className="h-4 w-px bg-line" />
      <h1 className="min-w-0 truncate text-md font-semibold">{name}</h1>
      {rotation && <RotationIndicator {...rotation} now={now} />}
      <span className="ml-auto flex items-center gap-4">
        <WakeLockChip />
        <time className="font-mono text-md text-ink" dateTime={new Date(now).toISOString()}>
          {formatClock(now)}
        </time>
        <Button
          type="text"
          aria-label="Exit TV mode"
          icon={<LuX />}
          onClick={onExit}
          className={`transition-opacity ${isIdle ? "opacity-0" : "opacity-100"}`}
        />
      </span>
    </header>
  );
}

type RotationIndicatorProps = {
  position: number;
  total: number;
  rotatedAt: number;
  everySec: number;
  now: number;
};

function RotationIndicator({ position, total, rotatedAt, everySec, now }: RotationIndicatorProps) {
  const remainingSec = Math.max(0, Math.ceil(everySec - (now - rotatedAt) / 1000));
  const filled = Math.round((remainingSec / everySec) * ROTATION_TICKS);

  return (
    <span className="flex items-center gap-2 font-mono text-xs text-subtle">
      <span>
        {position}/{total}
      </span>
      <TickMeter
        value={filled}
        total={ROTATION_TICKS}
        fillClassName="bg-accent"
        label="Time until the next dashboard"
      />
      <span className="w-8">{remainingSec}s</span>
    </span>
  );
}

function WakeLockChip() {
  const isAwake = useWakeLock();

  return (
    <span className="flex items-center gap-1.5 rounded-sm bg-hover px-2 py-0.5 text-xs text-muted">
      <StatusDot fill={isAwake ? "bg-up" : "bg-degraded"} />
      {isAwake ? "Screen awake" : "Screen may sleep"}
    </span>
  );
}
