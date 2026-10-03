import type { MaintenanceWindow } from "@/types/maintenance";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "@/lib/dates";

const now = Date.now();

function atHour(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date(now + daysFromNow * DAY_MS);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

function nextWeekday(weekday: number, hour: number) {
  const date = new Date(now);
  date.setDate(date.getDate() + ((weekday - date.getDay() + 7) % 7 || 7));
  date.setHours(hour, 0, 0, 0);
  return date.getTime();
}

function maintenanceWindow(
  fields: Omit<MaintenanceWindow, "timezone" | "createdAt" | "description"> & { description?: string },
) {
  return { timezone: "Asia/Kolkata", description: "", createdAt: fields.startsAt - 6 * DAY_MS, ...fields };
}

export const MAINTENANCE_WINDOWS: MaintenanceWindow[] = [
  maintenanceWindow({
    id: "mnt_payments",
    title: "Payments provider upgrade",
    description: "Razorpay is moving us to their v2 API. Checkout may return 503s for a few minutes.",
    project: "shopnest",
    monitorIds: ["mon_payments", "mon_checkout"],
    startsAt: now - 20 * MINUTE_MS,
    endsAt: now + 40 * MINUTE_MS,
    recurrence: null,
    showOnStatusPage: true,
    createdBy: "Kabir Shah",
  }),
  maintenanceWindow({
    id: "mnt_db_migration",
    title: "Database migration",
    description: "Moving bookings to the new Postgres cluster.",
    project: "bluepeak",
    monitorIds: ["mon_client_portal", "mon_booking_form"],
    startsAt: now + 26 * HOUR_MS,
    endsAt: now + 27 * HOUR_MS,
    recurrence: null,
    showOnStatusPage: true,
    createdBy: "Ananya Das",
  }),
  maintenanceWindow({
    id: "mnt_patch",
    title: "Weekly patch window",
    description: "OS and dependency updates on the API hosts.",
    project: "pixelcraft",
    monitorIds: ["mon_auth", "mon_public_api", "mon_graphql_gateway"],
    startsAt: nextWeekday(0, 2),
    endsAt: nextWeekday(0, 2) + HOUR_MS,
    recurrence: { freq: "weekly", weekdays: [0], until: null },
    showOnStatusPage: false,
    createdBy: "Meera Iyer",
  }),
  maintenanceWindow({
    id: "mnt_reindex",
    title: "Nightly search reindex",
    project: "pixelcraft",
    monitorIds: ["mon_search"],
    startsAt: atHour(1, 1, 30),
    endsAt: atHour(1, 1, 45),
    recurrence: { freq: "daily", weekdays: [], until: atHour(30, 0) },
    showOnStatusPage: false,
    createdBy: "Dev Patel",
  }),
  maintenanceWindow({
    id: "mnt_cert",
    title: "CDN certificate rotation",
    project: "pixelcraft",
    monitorIds: ["mon_cdn", "mon_pixelcraft_ssl"],
    startsAt: atHour(3, 23),
    endsAt: atHour(3, 23, 30),
    recurrence: null,
    showOnStatusPage: true,
    createdBy: "Meera Iyer",
  }),
  maintenanceWindow({
    id: "mnt_freeze",
    title: "Checkout load test",
    description: "Synthetic traffic at 5× peak to validate the Diwali sale capacity.",
    project: "shopnest",
    monitorIds: ["mon_checkout", "mon_cart_service", "mon_inventory_api"],
    startsAt: atHour(9, 6),
    endsAt: atHour(9, 8),
    recurrence: null,
    showOnStatusPage: false,
    createdBy: "Kabir Shah",
  }),
  maintenanceWindow({
    id: "mnt_dns",
    title: "DNS provider switch",
    project: "bluepeak",
    monitorIds: ["mon_marketing", "mon_bluepeak_careers", "mon_sitemap"],
    startsAt: atHour(-4, 22),
    endsAt: atHour(-4, 23),
    recurrence: null,
    showOnStatusPage: true,
    createdBy: "Ananya Das",
  }),
  maintenanceWindow({
    id: "mnt_k8s",
    title: "Kubernetes 1.31 upgrade",
    project: "pixelcraft",
    monitorIds: ["mon_render_queue", "mon_thumbnail_service", "mon_asset_uploader"],
    startsAt: atHour(-11, 3),
    endsAt: atHour(-11, 5),
    recurrence: null,
    showOnStatusPage: true,
    createdBy: "Meera Iyer",
  }),
  maintenanceWindow({
    id: "mnt_inventory",
    title: "Inventory API cutover",
    project: "shopnest",
    monitorIds: ["mon_inventory_api"],
    startsAt: atHour(-19, 4),
    endsAt: atHour(-19, 4, 45),
    recurrence: null,
    showOnStatusPage: false,
    createdBy: "Kabir Shah",
  }),
];
