import { formatUptime } from "@/lib/format";
import { uptimeTone } from "@/lib/status";

export function UptimeValue({ value, className = "" }: { value: number | null; className?: string }) {
  return <span className={`font-mono ${uptimeTone(value)} ${className}`}>{formatUptime(value)}</span>;
}
