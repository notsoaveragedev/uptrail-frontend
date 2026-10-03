import { DAY_MS, MINUTE_MS } from "@/lib/dates";
import type { Severity } from "@/types/alerts";
import type { Incident, IncidentStatus, TimelineEntry } from "@/types/incident";
import { MONITORS } from "./monitors";
import { seeded } from "./random";

const now = Date.now();

const PEOPLE = ["Arjun Rao", "Meera Iyer", "Kabir Shah", "Ananya Das"];

const STORIES = [
  {
    title: "Elevated latency on {name}",
    identified: "A slow database query after the 14:05 deploy is holding connections.",
    monitoring: "Rolled back the deploy. p95 is back under 400 ms; watching for recurrence.",
  },
  {
    title: "{name} returning 502s",
    identified: "The upstream load balancer lost two healthy targets in one zone.",
    monitoring: "Replaced the unhealthy targets. Error rate is back to baseline.",
  },
  {
    title: "{name} unreachable from Europe",
    identified: "A routing issue at our CDN edge in FRA is dropping connections.",
    monitoring: "Traffic was rerouted through AMS. FRA checks are passing again.",
  },
  {
    title: "Intermittent timeouts on {name}",
    identified: "Connection pool exhaustion under a traffic spike from a marketing email.",
    monitoring: "Raised the pool size and added a rate limit. Monitoring the next send.",
  },
];

const SEVERITIES: Severity[] = ["minor", "major", "critical"];

function entry(id: string, fields: Omit<TimelineEntry, "id">): TimelineEntry {
  return { id, ...fields };
}

function resolvedIncident(number: number, random: () => number): Incident {
  const monitor = MONITORS[Math.floor(random() * 12)];
  const story = STORIES[Math.floor(random() * STORIES.length)];
  const severity = SEVERITIES[Math.floor(random() * SEVERITIES.length)];
  const startedAt = now - Math.round((2 + random() * 86) * DAY_MS);
  const ackAfter = Math.round((1 + random() * 9) * MINUTE_MS);
  const resolveAfter = Math.round((12 + random() * 90) * MINUTE_MS);
  const assignee = PEOPLE[Math.floor(random() * PEOPLE.length)];
  const id = `INC-${number}`;
  const at = (offset: number) => startedAt + offset;
  const statusAt = (status: IncidentStatus, offset: number, message: string, isPublic: boolean) =>
    entry(`${id}-${status}`, {
      kind: "update",
      event: "status_changed",
      status,
      message,
      isPublic,
      author: assignee,
      at: at(offset),
    });

  return {
    id,
    number,
    title: story.title.replace("{name}", monitor.name),
    severity,
    status: "resolved",
    source: random() > 0.3 ? "auto" : "manual",
    project: monitor.project,
    monitorIds: [monitor.id],
    alertEventIds: [],
    assignee,
    timeline: [
      entry(`${id}-down`, {
        kind: "auto",
        event: "monitor_down",
        status: null,
        message: `${monitor.name} failed checks from 2 regions.`,
        isPublic: false,
        author: null,
        at: at(0),
      }),
      entry(`${id}-alert`, {
        kind: "auto",
        event: "alert_sent",
        status: null,
        message: "Alert sent to #oncall.",
        isPublic: false,
        author: null,
        at: at(40_000),
      }),
      entry(`${id}-declared`, {
        kind: "update",
        event: "declared",
        status: "investigating",
        message: `We're investigating reports of issues with ${monitor.name}.`,
        isPublic: true,
        author: assignee,
        at: at(90_000),
      }),
      entry(`${id}-ack`, {
        kind: "auto",
        event: "acknowledged",
        status: null,
        message: null,
        isPublic: false,
        author: assignee,
        at: at(ackAfter),
      }),
      statusAt("identified", ackAfter + 6 * MINUTE_MS, story.identified, true),
      statusAt("monitoring", resolveAfter - 8 * MINUTE_MS, story.monitoring, true),
      entry(`${id}-recovered`, {
        kind: "auto",
        event: "recovered",
        status: null,
        message: `${monitor.name} is passing checks in every region.`,
        isPublic: false,
        author: null,
        at: at(resolveAfter - 60_000),
      }),
      statusAt("resolved", resolveAfter, "This incident has been resolved. We'll publish a follow-up review.", true),
    ].reverse(),
    startedAt,
    acknowledgedAt: at(ackAfter),
    acknowledgedBy: assignee,
    resolvedAt: at(resolveAfter),
    updatedAt: at(resolveAfter),
  };
}

const liveStart = now - 380_000;

const LIVE_INCIDENT: Incident = {
  id: "INC-42",
  number: 42,
  title: "Checkout API unreachable",
  severity: "critical",
  status: "investigating",
  source: "auto",
  project: "shopnest",
  monitorIds: ["mon_checkout", "mon_payments"],
  alertEventIds: ["evt_live_down"],
  assignee: "Arjun Rao",
  timeline: [
    entry("INC-42-update", {
      kind: "update",
      event: "note",
      status: "investigating",
      message:
        "Payment gateway is timing out from **BOM** and **FRA**. IAD is healthy, so we're failing over to the secondary provider.",
      isPublic: true,
      author: "Arjun Rao",
      at: liveStart + 3 * MINUTE_MS,
    }),
    entry("INC-42-declared", {
      kind: "update",
      event: "declared",
      status: "investigating",
      message: "We're investigating failed checkouts for some customers.",
      isPublic: true,
      author: "Arjun Rao",
      at: liveStart + 70_000,
    }),
    entry("INC-42-alert", {
      kind: "auto",
      event: "alert_sent",
      status: null,
      message: "Down in 2+ regions → #oncall, PagerDuty bridge.",
      isPublic: false,
      author: null,
      at: liveStart + 30_000,
    }),
    entry("INC-42-down", {
      kind: "auto",
      event: "monitor_down",
      status: null,
      message: "Checkout API timed out from BOM and FRA.",
      isPublic: false,
      author: null,
      at: liveStart,
    }),
  ],
  startedAt: liveStart,
  acknowledgedAt: null,
  acknowledgedBy: null,
  resolvedAt: null,
  updatedAt: liveStart + 3 * MINUTE_MS,
};

function buildIncidents() {
  const random = seeded(4242);
  const resolved = Array.from({ length: 30 }, (_, index) => resolvedIncident(12 + index, random));
  return [LIVE_INCIDENT, ...resolved.sort((a, b) => b.startedAt - a.startedAt)];
}

export const INCIDENTS = buildIncidents();

export const INCIDENT_PEOPLE = PEOPLE;
