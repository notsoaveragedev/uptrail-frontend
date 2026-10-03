import { HOUR_MS, MINUTE_MS } from "@/lib/dates";
import { LATENCY_THRESHOLD_MS } from "@/lib/format";
import type { AppNotification } from "@/types/workspace";
import { seeded } from "./random";

const now = Date.now();

type Template = Omit<AppNotification, "id" | "at" | "isUnread">;

const RECENT: (Template & { minutesAgo: number; isUnread: boolean })[] = [
  {
    type: "monitor_down",
    title: "Checkout API is down",
    detail: "Failing from BOM and FRA · INC-42 opened",
    project: "shopnest",
    href: "incidents/INC-42",
    minutesAgo: 6,
    isUnread: true,
  },
  {
    type: "alert_fired",
    title: "Search service degraded",
    detail: `p95 1.24 s, above the ${LATENCY_THRESHOLD_MS} ms threshold`,
    project: "pixelcraft",
    href: "monitors/mon_search",
    minutesAgo: 12,
    isUnread: true,
  },
  {
    type: "incident_updated",
    title: "INC-42 moved to Identified",
    detail: "Kabir Shah: a slow query after the 14:05 deploy is holding connections.",
    project: "shopnest",
    href: "incidents/INC-42",
    minutesAgo: 31,
    isUnread: true,
  },
  {
    type: "ssl_expiring",
    title: "SSL certificate expires in 6 days",
    detail: "cdn.pixelcraft.io · renews automatically if DNS is valid",
    project: "pixelcraft",
    href: "monitors/mon_cdn",
    minutesAgo: 130,
    isUnread: true,
  },
  {
    type: "role_changed",
    title: "Your role in Bluepeak is now Editor",
    detail: "Arjun Rao added a project override",
    project: "bluepeak",
    href: null,
    minutesAgo: 300,
    isUnread: false,
  },
  {
    type: "invite_accepted",
    title: "Tom Becker joined Pixelcraft Studio",
    detail: "Accepted an invite as Client viewer",
    project: null,
    href: "settings/members",
    minutesAgo: 1500,
    isUnread: false,
  },
];

const ROTATION: Template[] = [
  {
    type: "monitor_up",
    title: "Image CDN recovered",
    detail: "Down for 4m 12s · all regions passing",
    project: "pixelcraft",
    href: "monitors/mon_cdn",
  },
  {
    type: "monitor_down",
    title: "Booking form is down",
    detail: "Keyword “Book now” missing from the response",
    project: "bluepeak",
    href: "monitors/mon_booking_form",
  },
  {
    type: "alert_fired",
    title: "Cart service error rate above 2%",
    detail: "Rule “Cart 5xx spike” fired from IAD",
    project: "shopnest",
    href: "alerts/history",
  },
  {
    type: "incident_created",
    title: "Incident declared: Elevated latency on Public API v1",
    detail: "Major · assigned to Dev Patel",
    project: "pixelcraft",
    href: "incidents",
  },
  {
    type: "incident_updated",
    title: "Incident resolved: Booking form unreachable",
    detail: "Resolved by Ananya Das after 38m",
    project: "bluepeak",
    href: "incidents",
  },
  {
    type: "monitor_up",
    title: "Payments webhook recovered",
    detail: "Back to 200 OK after 2 failed checks",
    project: "shopnest",
    href: "monitors/mon_payments",
  },
];

function olderNotifications(): AppNotification[] {
  const random = seeded(4242);
  let at = now - 30 * HOUR_MS;
  return Array.from({ length: 34 }, (_, index) => {
    at -= Math.round((2 + random() * 9) * HOUR_MS);
    return { ...ROTATION[index % ROTATION.length], id: `ntf_old_${index}`, at, isUnread: index < 2 };
  });
}

export const NOTIFICATIONS: AppNotification[] = [
  ...RECENT.map(({ minutesAgo, ...fields }, index) => ({
    ...fields,
    id: `ntf_${index}`,
    at: now - minutesAgo * MINUTE_MS,
  })),
  ...olderNotifications(),
];
