import { MINUTE_MS } from "@/lib/dates";
import type { AuditActorType, AuditEvent, AuditValue } from "@/types/audit";
import { seeded } from "./random";

const now = Date.now();

type Diff = { before: Record<string, AuditValue> | null; after: Record<string, AuditValue> | null };

type Recipe = {
  action: string;
  resourceType: string;
  names: string[];
  actorTypes?: AuditActorType[];
  diff: (pick: <Item>(items: Item[]) => Item) => Diff;
};

const PEOPLE = ["Arjun Rao", "Meera Iyer", "Kabir Shah", "Ananya Das", "Dev Patel", "Ishaan Gupta"];
const KEYS = ["Terraform provider", "GitHub Actions deploy", "PagerDuty bridge"];
const IPS = ["49.36.112.18", "103.21.244.9", "34.120.18.77", "140.82.112.4", "122.171.19.4", "18.194.22.130"];
const AGENTS = ["Chrome 129 · macOS", "Firefox 131 · Ubuntu", "Safari 18 · iOS", "terraform-provider-uptrail/1.4"];
const MONITORS = ["Checkout API", "Search service", "Auth service", "Image CDN", "Cart service", "Booking form"];
const ROLES = ["Editor", "Viewer", "On-call engineer", "Client viewer"];
const PROJECTS = ["shopnest", "pixelcraft", "bluepeak"];
const INTERVALS = [30, 60, 300];

const RECIPES: Recipe[] = [
  {
    action: "monitor.update",
    resourceType: "monitor",
    names: MONITORS,
    actorTypes: ["user", "user", "api_key"],
    diff: (pick) => {
      const [from, to] = [pick(INTERVALS), pick(INTERVALS)];
      return {
        before: { interval_sec: from, regions: ["BOM", "FRA"], timeout_ms: 10000 },
        after: { interval_sec: to === from ? from * 2 : to, regions: ["BOM", "FRA", "IAD"], timeout_ms: 10000 },
      };
    },
  },
  {
    action: "monitor.create",
    resourceType: "monitor",
    names: MONITORS,
    actorTypes: ["user", "api_key"],
    diff: (pick) => ({ before: null, after: { type: "http", interval_sec: pick(INTERVALS), method: "GET" } }),
  },
  {
    action: "monitor.delete",
    resourceType: "monitor",
    names: ["Old landing page", "Legacy API v0", "Staging webhook"],
    diff: () => ({ before: { type: "http", interval_sec: 300, paused: true }, after: null }),
  },
  {
    action: "monitor.pause",
    resourceType: "monitor",
    names: MONITORS,
    diff: () => ({ before: { paused: false }, after: { paused: true } }),
  },
  {
    action: "role.update",
    resourceType: "role",
    names: ["On-call engineer", "Client viewer"],
    diff: () => ({
      before: { permissions: ["incident:read", "incident:update", "alert:read"] },
      after: { permissions: ["incident:read", "incident:update", "incident:create", "alert:read", "alert:manage"] },
    }),
  },
  {
    action: "member.invite",
    resourceType: "member",
    names: ["nikhil@pixelcraft.io", "claire@bluepeak.agency", "ops@shopnest.com"],
    diff: (pick) => ({ before: null, after: { role: pick(ROLES), expires_in_days: 7 } }),
  },
  {
    action: "member.role_change",
    resourceType: "member",
    names: ["Rohan Mehta", "Sara Khan", "Ishaan Gupta"],
    diff: () => ({ before: { role: "Viewer" }, after: { role: "Editor" } }),
  },
  {
    action: "member.remove",
    resourceType: "member",
    names: ["Neha Kulkarni", "Marco Rossi"],
    diff: (pick) => ({ before: { role: pick(ROLES), email: "former@pixelcraft.io" }, after: null }),
  },
  {
    action: "apikey.create",
    resourceType: "api_key",
    names: KEYS,
    diff: () => ({ before: null, after: { prefix: "upt_live_b21c", scopes: ["monitor:read", "monitor:update"] } }),
  },
  {
    action: "apikey.revoke",
    resourceType: "api_key",
    names: ["Legacy status script"],
    diff: () => ({ before: { revoked: false }, after: { revoked: true } }),
  },
  {
    action: "statuspage.publish",
    resourceType: "status_page",
    names: ["Shopnest Status", "Pixelcraft Status"],
    diff: () => ({ before: { published: false }, after: { published: true } }),
  },
  {
    action: "alert_rule.update",
    resourceType: "alert_rule",
    names: ["Checkout down", "Cart 5xx spike", "Search p95 latency"],
    actorTypes: ["user", "api_key"],
    diff: () => ({ before: { threshold_ms: 800, for: "2m" }, after: { threshold_ms: 1200, for: "5m" } }),
  },
  {
    action: "incident.resolve",
    resourceType: "incident",
    names: ["INC-39", "INC-40", "INC-41"],
    actorTypes: ["user", "system"],
    diff: () => ({ before: { status: "monitoring" }, after: { status: "resolved" } }),
  },
  {
    action: "org.update",
    resourceType: "organization",
    names: ["Pixelcraft Studio"],
    diff: () => ({ before: { timezone: "UTC" }, after: { timezone: "Asia/Kolkata" } }),
  },
];

function actorName(type: AuditActorType, pick: <Item>(items: Item[]) => Item) {
  if (type === "system") return "Uptrail";
  return type === "api_key" ? pick(KEYS) : pick(PEOPLE);
}

function buildAuditLog(count: number): AuditEvent[] {
  const random = seeded(9001);
  const pick = <Item>(items: Item[]) => items[Math.floor(random() * items.length)];
  let at = now - 4 * MINUTE_MS;

  return Array.from({ length: count }, (_, index) => {
    const recipe = pick(RECIPES);
    const actorType = pick<AuditActorType>(recipe.actorTypes ?? ["user"]);
    at -= Math.round((5 + random() * 190) * MINUTE_MS);
    return {
      id: `aud_${String(count - index).padStart(5, "0")}`,
      actor: { type: actorType, name: actorName(actorType, pick) },
      action: recipe.action,
      resource: { type: recipe.resourceType, id: `${recipe.resourceType}_${index}`, name: pick(recipe.names) },
      project: recipe.resourceType === "monitor" || recipe.resourceType === "alert_rule" ? pick(PROJECTS) : null,
      ...recipe.diff(pick),
      ip: actorType === "system" ? null : pick(IPS),
      userAgent: actorType === "system" ? null : actorType === "api_key" ? AGENTS[3] : pick(AGENTS.slice(0, 3)),
      requestId: `req_${Math.floor(random() * 1e12).toString(36)}`,
      at,
    };
  });
}

export const AUDIT_EVENTS = buildAuditLog(1200);
