import { LATENCY_THRESHOLD_MS } from "@/lib/format";
import type { AppNotification, Organization } from "@/types/workspace";

export const currentUser = {
  name: "Meera Iyer",
  email: "meera@pixelcraft.io",
  initials: "MI",
};

export const organizations: Organization[] = [
  { slug: "pixelcraft", name: "Pixelcraft Studio", initials: "PS", role: "Admin" },
  { slug: "bluepeak", name: "Bluepeak Agency", initials: "BA", role: "Editor" },
  { slug: "shopnest", name: "Shopnest", initials: "SN", role: "Viewer" },
];

export const notifications: AppNotification[] = [
  {
    id: "n1",
    title: "Checkout API is down",
    detail: "Failing from BOM and FRA · INC-42 opened",
    time: "6m",
    tone: "down",
    isUnread: true,
  },
  {
    id: "n2",
    title: "Search service degraded",
    detail: `p95 1.24 s, above the ${LATENCY_THRESHOLD_MS} ms threshold`,
    time: "12m",
    tone: "degraded",
    isUnread: true,
  },
  {
    id: "n3",
    title: "SSL certificate expires in 6 days",
    detail: "cdn.pixelcraft.io · renews Oct 2",
    time: "2h",
    tone: "degraded",
    isUnread: true,
  },
  {
    id: "n4",
    title: "Arjun Kapoor joined Pixelcraft Studio",
    detail: "Accepted an invite as Editor",
    time: "1d",
    tone: "info",
    isUnread: false,
  },
];
