import type { Project } from "@/types/project";
import { DAY_MS } from "@/lib/dates";

const now = Date.now();

export const PROJECTS: Project[] = [
  {
    id: "prj_shopnest",
    slug: "shopnest",
    name: "Shopnest",
    description: "Storefront, checkout and payments for the Shopnest retail client.",
    tags: ["client", "e-commerce", "tier-1"],
    createdAt: now - 380 * DAY_MS,
  },
  {
    id: "prj_pixelcraft",
    slug: "pixelcraft",
    name: "Pixelcraft",
    description: "Our own marketing site, app and internal tooling.",
    tags: ["internal", "production"],
    createdAt: now - 410 * DAY_MS,
  },
  {
    id: "prj_bluepeak",
    slug: "bluepeak",
    name: "Bluepeak",
    description: "Booking platform and partner APIs for Bluepeak Agency.",
    tags: ["client", "api"],
    createdAt: now - 210 * DAY_MS,
  },
];
