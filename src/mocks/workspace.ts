import type { Organization, OrgSettings } from "@/types/workspace";

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

export const ORG_SETTINGS: OrgSettings = {
  name: "Pixelcraft Studio",
  slug: "pixelcraft",
  logoUrl: null,
  timezone: "Asia/Kolkata",
};

export const SEAT_LIMIT = 15;

export const TAKEN_ORG_SLUGS = ["acme", "uptrail", "admin", "bluepeak", "shopnest", "status"];
