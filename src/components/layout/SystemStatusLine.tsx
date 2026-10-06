import { StatusDot } from "@/components/ui/StatusDot";

export function SystemStatusLine() {
  return (
    <p className="flex items-center gap-2">
      <StatusDot className="text-up" />
      All systems operational
      <span className="hidden font-mono sm:inline">· 99.98% uptime · 214 ms p95</span>
    </p>
  );
}
