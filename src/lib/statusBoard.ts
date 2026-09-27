import type { MonitorStatus } from "@/types/monitor";
import { statusTrail } from "./status";

type BoardMonitor = {
  name: string;
  url: string;
  status: MonitorStatus;
  latency: string;
  regions: string;
  checks: MonitorStatus[];
};

const CHECK_COUNT = 40;

function trail(fill: MonitorStatus, overrides: Record<number, MonitorStatus> = {}) {
  return statusTrail(CHECK_COUNT, fill, overrides);
}

export const BOARD_MONITORS: BoardMonitor[] = [
  {
    name: "Checkout API",
    url: "api.shopnest.in",
    status: "up",
    latency: "212 ms",
    regions: "BOM FRA IAD",
    checks: trail("up", { 17: "down", 18: "down", 19: "degraded" }),
  },
  {
    name: "Search service",
    url: "search.pixelcraft.io",
    status: "degraded",
    latency: "1.24 s",
    regions: "BOM FRA",
    checks: trail("up", {
      33: "degraded",
      34: "degraded",
      35: "up",
      36: "degraded",
      37: "degraded",
      38: "degraded",
      39: "degraded",
    }),
  },
  {
    name: "Auth service",
    url: "auth.pixelcraft.io",
    status: "up",
    latency: "61 ms",
    regions: "FRA IAD",
    checks: trail("up"),
  },
  {
    name: "Payments webhook",
    url: "hooks.shopnest.in",
    status: "up",
    latency: "198 ms",
    regions: "BOM IAD",
    checks: trail("up", { 8: "degraded" }),
  },
  {
    name: "Marketing site",
    url: "www.bluepeak.co",
    status: "up",
    latency: "340 ms",
    regions: "FRA IAD",
    checks: trail("up", { 24: "degraded", 25: "degraded" }),
  },
  {
    name: "Image CDN",
    url: "cdn.pixelcraft.io",
    status: "up",
    latency: "88 ms",
    regions: "BOM FRA IAD",
    checks: trail("up"),
  },
  {
    name: "Public API v1",
    url: "api.pixelcraft.io",
    status: "up",
    latency: "211 ms",
    regions: "BOM FRA IAD",
    checks: trail("up", { 3: "down", 4: "degraded" }),
  },
  {
    name: "Staging API",
    url: "staging-api.shopnest.in",
    status: "paused",
    latency: "—",
    regions: "BOM",
    checks: trail("up", Object.fromEntries(Array.from({ length: 14 }, (_, index) => [26 + index, "paused"]))),
  },
];
