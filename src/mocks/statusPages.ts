import type { StatusPage, StatusSubscriber } from "@/types/statusPage";
import { seeded } from "./random";
import { DAY_MS } from "@/lib/dates";

const now = Date.now();

const LIGHT = { background: "#FFFFFF", surface: "#F7F7F5", text: "#16171A" };

export const STATUS_PAGES: StatusPage[] = [
  {
    id: "sp_shopnest",
    slug: "shopnest",
    project: "shopnest",
    title: "Shopnest",
    description: "Live status for Shopnest checkout, payments and storefront.",
    logoUrl: null,
    theme: { primary: "#2563EB", ...LIGHT, mode: "light" },
    groups: [
      {
        id: "grp_payments",
        name: "Payments",
        components: [
          { monitorId: "mon_checkout", displayName: "Checkout", showChart: true },
          { monitorId: "mon_payments", displayName: "Payment webhooks", showChart: false },
        ],
      },
      {
        id: "grp_store",
        name: "Storefront",
        components: [
          { monitorId: "mon_storefront", displayName: "Website", showChart: false },
          { monitorId: "mon_cart_service", displayName: "Cart", showChart: false },
          { monitorId: "mon_order_events", displayName: "Order updates", showChart: false },
        ],
      },
    ],
    options: { showUptimeBars: true, showResponseTimes: true, historyDays: 90 },
    customDomain: { host: "status.shopnest.in", verified: true },
    published: true,
    updatedAt: now - 2 * 3_600_000,
  },
  {
    id: "sp_pixelcraft",
    slug: "pixelcraft",
    project: "pixelcraft",
    title: "Pixelcraft",
    description: "Current status of the Pixelcraft API and apps.",
    logoUrl: null,
    theme: { primary: "#C2410C", ...LIGHT, mode: "auto" },
    groups: [
      {
        id: "grp_api",
        name: "API",
        components: [
          { monitorId: "mon_public_api", displayName: "Public API", showChart: true },
          { monitorId: "mon_auth", displayName: "Authentication", showChart: false },
          { monitorId: "mon_search", displayName: "Search", showChart: true },
        ],
      },
      {
        id: "grp_assets",
        name: "Assets",
        components: [
          { monitorId: "mon_cdn", displayName: "Image CDN", showChart: false },
          { monitorId: "mon_asset_uploader", displayName: "Uploads", showChart: false },
        ],
      },
    ],
    options: { showUptimeBars: true, showResponseTimes: false, historyDays: 90 },
    customDomain: { host: "status.pixelcraft.io", verified: true },
    published: true,
    updatedAt: now - 3 * DAY_MS,
  },
  {
    id: "sp_bluepeak",
    slug: "bluepeak",
    project: "bluepeak",
    title: "Bluepeak Agency",
    description: "Client-facing status for Bluepeak sites.",
    logoUrl: null,
    theme: { primary: "#0F766E", ...LIGHT, mode: "light" },
    groups: [
      {
        id: "grp_sites",
        name: "Websites",
        components: [
          { monitorId: "mon_marketing", displayName: "Marketing site", showChart: false },
          { monitorId: "mon_client_portal", displayName: "Client portal", showChart: false },
        ],
      },
    ],
    options: { showUptimeBars: true, showResponseTimes: false, historyDays: 30 },
    customDomain: null,
    published: false,
    updatedAt: now - 9 * DAY_MS,
  },
];

const NAMES = ["ops", "hello", "dev", "support", "cto", "alerts", "team", "admin", "sre", "billing"];
const DOMAINS = ["acme.co", "northwind.io", "globex.com", "initech.dev", "umbrella.app", "hooli.xyz"];

function buildSubscribers(): StatusSubscriber[] {
  const random = seeded(99);
  return STATUS_PAGES.flatMap((page, pageIndex) =>
    Array.from({ length: [34, 21, 6][pageIndex] }, (_, index) => ({
      id: `sub_${page.slug}_${index}`,
      pageId: page.id,
      email: `${NAMES[Math.floor(random() * NAMES.length)]}${index}@${DOMAINS[Math.floor(random() * DOMAINS.length)]}`,
      confirmed: random() > 0.15,
      createdAt: now - Math.round(random() * 120 * DAY_MS),
    })),
  );
}

export const STATUS_SUBSCRIBERS = buildSubscribers();
