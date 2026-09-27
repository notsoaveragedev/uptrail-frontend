import type { TimingPhase } from "@/types/logs";

export const TIMING_PHASES: { key: TimingPhase; label: string; fill: string }[] = [
  { key: "dns", label: "DNS", fill: "bg-faint" },
  { key: "connect", label: "Connect", fill: "bg-subtle" },
  { key: "tls", label: "TLS", fill: "bg-series-2" },
  { key: "ttfb", label: "TTFB", fill: "bg-series-1" },
  { key: "download", label: "Download", fill: "bg-series-4" },
];
