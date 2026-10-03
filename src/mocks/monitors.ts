import { HOUR_MS } from "@/lib/dates";
import { statusTrail } from "@/lib/status";
import type { HttpMethod, Monitor, MonitorStatus, MonitorType, RegionCode } from "@/types/monitor";
import { seeded } from "./random";

const CHECK_COUNT = 30;
const HISTORY_COUNT = 24;

function history(base: number, seed: number) {
  const random = seeded(seed);
  return Array.from({ length: HISTORY_COUNT }, () => Math.round(base * (0.85 + random() * 0.3)));
}

function secondsAgo(seconds: number) {
  return Date.now() - seconds * 1000;
}

function regions(codes: RegionCode[], overrides: Partial<Record<RegionCode, MonitorStatus>> = {}) {
  return codes.map((code) => ({ code, status: overrides[code] ?? ("up" as const) }));
}

type Seed = {
  id: string;
  name: string;
  url: string;
  type: MonitorType;
  method?: HttpMethod;
  intervalSec: number;
  project: string;
  tags: string[];
  status?: MonitorStatus;
  latencyMs: number | null;
  uptime24h: number | null;
  uptime30d: number | null;
  regionOverrides?: Partial<Record<RegionCode, MonitorStatus>>;
  checkOverrides?: Record<number, MonitorStatus>;
  lastCheckedSec: number;
  sinceHours?: number;
};

function monitor(seed: Seed, index: number): Monitor {
  const status = seed.status ?? "up";
  const base = seed.latencyMs ?? 300;
  return {
    id: seed.id,
    name: seed.name,
    url: seed.url,
    type: seed.type,
    method: seed.method ?? "GET",
    intervalSec: seed.intervalSec,
    project: seed.project,
    tags: seed.tags,
    status,
    statusSince: Date.now() - (seed.sinceHours ?? 24 * (index + 3)) * HOUR_MS,
    latencyMs: seed.latencyMs,
    uptime24h: seed.uptime24h,
    uptime30d: seed.uptime30d,
    regions: regions(
      ["BOM", "FRA", "IAD"],
      status === "paused" ? { BOM: "paused", FRA: "paused", IAD: "paused" } : seed.regionOverrides,
    ),
    checks: statusTrail(CHECK_COUNT, status === "paused" ? "paused" : "up", seed.checkOverrides),
    latencyHistory: history(base, index * 17 + 3),
    lastCheckedAt: secondsAgo(seed.lastCheckedSec),
  };
}

const FEATURED: Seed[] = [
  {
    id: "mon_checkout",
    name: "Checkout API",
    url: "https://api.shopnest.in/v2/checkout",
    type: "http",
    method: "POST",
    intervalSec: 30,
    project: "shopnest",
    tags: ["production", "payments", "tier-1"],
    status: "down",
    latencyMs: null,
    uptime24h: 97.81,
    uptime30d: 99.88,
    regionOverrides: { BOM: "down", FRA: "down" },
    checkOverrides: {
      21: "degraded",
      23: "degraded",
      24: "down",
      25: "down",
      26: "down",
      27: "down",
      28: "down",
      29: "down",
    },
    lastCheckedSec: 6,
    sinceHours: 0.1,
  },
  {
    id: "mon_search",
    name: "Search service",
    url: "https://search.pixelcraft.io/health",
    type: "json",
    intervalSec: 60,
    project: "pixelcraft",
    tags: ["production", "api"],
    status: "degraded",
    latencyMs: 1240,
    uptime24h: 99.62,
    uptime30d: 99.71,
    regionOverrides: { BOM: "degraded", IAD: "degraded" },
    checkOverrides: { 19: "degraded", 22: "degraded", 23: "degraded", 26: "degraded", 28: "degraded", 29: "degraded" },
    lastCheckedSec: 12,
    sinceHours: 0.7,
  },
  {
    id: "mon_marketing",
    name: "Marketing site",
    url: "https://www.bluepeak.co",
    type: "keyword",
    intervalSec: 60,
    project: "bluepeak",
    tags: ["production", "marketing"],
    status: "degraded",
    latencyMs: 890,
    uptime24h: 99.9,
    uptime30d: 99.93,
    regionOverrides: { FRA: "degraded" },
    checkOverrides: { 20: "degraded", 27: "degraded", 29: "degraded" },
    lastCheckedSec: 21,
    sinceHours: 1.2,
  },
  {
    id: "mon_auth",
    name: "Auth service",
    url: "https://auth.pixelcraft.io/health",
    type: "http",
    intervalSec: 30,
    project: "pixelcraft",
    tags: ["production", "api", "tier-1"],
    latencyMs: 142,
    uptime24h: 100,
    uptime30d: 100,
    lastCheckedSec: 4,
  },
  {
    id: "mon_payments",
    name: "Payments webhook",
    url: "https://hooks.shopnest.in/payments",
    type: "response_time",
    method: "POST",
    intervalSec: 30,
    project: "shopnest",
    tags: ["production", "payments"],
    latencyMs: 198,
    uptime24h: 99.98,
    uptime30d: 99.98,
    checkOverrides: { 11: "degraded" },
    lastCheckedSec: 15,
  },
  {
    id: "mon_admin",
    name: "Admin dashboard",
    url: "https://admin.bluepeak.co",
    type: "keyword",
    intervalSec: 300,
    project: "bluepeak",
    tags: ["internal"],
    latencyMs: 326,
    uptime24h: 99.99,
    uptime30d: 99.99,
    checkOverrides: { 17: "degraded" },
    lastCheckedSec: 30,
  },
  {
    id: "mon_cdn",
    name: "Image CDN",
    url: "https://cdn.pixelcraft.io",
    type: "ssl",
    intervalSec: 3600,
    project: "pixelcraft",
    tags: ["production", "customer-facing"],
    latencyMs: 88,
    uptime24h: 100,
    uptime30d: 100,
    lastCheckedSec: 9,
  },
  {
    id: "mon_public_api",
    name: "Public API v1",
    url: "https://api.pixelcraft.io/v1/status",
    type: "json",
    intervalSec: 60,
    project: "pixelcraft",
    tags: ["production", "api", "customer-facing"],
    latencyMs: 211,
    uptime24h: 99.97,
    uptime30d: 99.97,
    checkOverrides: { 6: "degraded" },
    lastCheckedSec: 18,
  },
  {
    id: "mon_blog",
    name: "Blog",
    url: "https://blog.bluepeak.co",
    type: "keyword",
    intervalSec: 300,
    project: "bluepeak",
    tags: ["marketing"],
    latencyMs: 402,
    uptime24h: 100,
    uptime30d: 99.99,
    lastCheckedSec: 45,
  },
  {
    id: "mon_staging",
    name: "Staging API",
    url: "https://staging-api.shopnest.in",
    type: "http",
    intervalSec: 60,
    project: "shopnest",
    tags: ["staging"],
    status: "paused",
    latencyMs: null,
    uptime24h: null,
    uptime30d: null,
    lastCheckedSec: 7200,
    sinceHours: 2,
  },
];

const FLEET: [string, string, MonitorType, string, string[]][] = [
  ["Storefront", "https://shopnest.in", "keyword", "shopnest", ["production", "customer-facing"]],
  ["Cart service", "https://api.shopnest.in/v2/cart", "http", "shopnest", ["production", "api"]],
  ["Inventory API", "https://inventory.shopnest.in/health", "json", "shopnest", ["production", "api"]],
  ["Order events", "https://events.shopnest.in/orders", "http", "shopnest", ["production"]],
  ["Shipping rates API", "https://api.shopnest.in/v2/shipping", "json", "shopnest", ["production", "api"]],
  ["Promo engine", "https://promo.shopnest.in/health", "http", "shopnest", ["production"]],
  ["Customer portal", "https://account.shopnest.in", "keyword", "shopnest", ["customer-facing"]],
  ["Loyalty API", "https://loyalty.shopnest.in/health", "http", "shopnest", ["api"]],
  ["Reviews widget", "https://reviews.shopnest.in/widget.js", "response_time", "shopnest", ["customer-facing"]],
  ["Shopnest SSL", "https://shopnest.in", "ssl", "shopnest", ["production"]],
  ["Pixelcraft site", "https://pixelcraft.io", "keyword", "pixelcraft", ["marketing"]],
  ["Asset uploader", "https://upload.pixelcraft.io/health", "http", "pixelcraft", ["production", "api"]],
  ["Render queue", "https://render.pixelcraft.io/status", "json", "pixelcraft", ["production"]],
  ["Thumbnail service", "https://thumbs.pixelcraft.io/health", "response_time", "pixelcraft", ["production"]],
  ["Webhooks relay", "https://relay.pixelcraft.io/health", "http", "pixelcraft", ["api"]],
  ["Billing API", "https://billing.pixelcraft.io/health", "json", "pixelcraft", ["production", "payments"]],
  ["GraphQL gateway", "https://gql.pixelcraft.io/health", "json", "pixelcraft", ["production", "api", "tier-1"]],
  ["Realtime socket", "https://rt.pixelcraft.io/health", "response_time", "pixelcraft", ["production"]],
  ["Docs site", "https://docs.pixelcraft.io", "keyword", "pixelcraft", ["customer-facing"]],
  ["Email delivery", "https://mail.pixelcraft.io/health", "http", "pixelcraft", ["internal"]],
  ["Feature flags", "https://flags.pixelcraft.io/health", "json", "pixelcraft", ["internal", "api"]],
  ["Pixelcraft SSL", "https://pixelcraft.io", "ssl", "pixelcraft", ["production"]],
  ["Bluepeak careers", "https://careers.bluepeak.co", "keyword", "bluepeak", ["marketing"]],
  ["Client portal", "https://clients.bluepeak.co", "keyword", "bluepeak", ["customer-facing", "tier-1"]],
  ["Analytics collector", "https://collect.bluepeak.co/health", "response_time", "bluepeak", ["internal"]],
  ["Recommendations API", "https://recs.bluepeak.co/health", "json", "bluepeak", ["api"]],
  ["Booking form", "https://www.bluepeak.co/book", "keyword", "bluepeak", ["marketing", "customer-facing"]],
  ["SMS gateway", "https://sms.bluepeak.co/health", "http", "bluepeak", ["internal"]],
  ["Case studies CDN", "https://media.bluepeak.co", "ssl", "bluepeak", ["marketing"]],
  ["Newsletter API", "https://news.bluepeak.co/health", "http", "bluepeak", ["marketing", "api"]],
  ["Bluepeak SSL", "https://bluepeak.co", "ssl", "bluepeak", ["production"]],
  ["Sitemap", "https://www.bluepeak.co/sitemap.xml", "http", "bluepeak", ["marketing"]],
];

const INTERVALS = [30, 60, 60, 300, 60, 30, 300, 3600];

const fleetSeeds: Seed[] = FLEET.map(([name, url, type, project, tags], index) => {
  const random = seeded(index * 31 + 7);
  return {
    id: `mon_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name,
    url,
    type,
    intervalSec: type === "ssl" ? 3600 : INTERVALS[index % INTERVALS.length],
    project,
    tags,
    latencyMs: Math.round(80 + random() * 420),
    uptime24h: index % 4 === 0 ? 100 : Number((99.9 + random() * 0.09).toFixed(2)),
    uptime30d: Number((99.85 + random() * 0.14).toFixed(2)),
    checkOverrides: index % 3 === 0 ? { [Math.floor(random() * 30)]: "degraded" } : {},
    lastCheckedSec: Math.round(2 + random() * 110),
  };
});

export const MONITORS: Monitor[] = [...FEATURED, ...fleetSeeds].map(monitor);
