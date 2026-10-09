import { DAY_MS, HOUR_MS, MINUTE_MS } from "@/lib/dates";
import type { Account, AccountOrganization, AuthSession, NotificationPreference, SecurityState } from "@/types/account";

const now = Date.now();

export const ACCOUNT: Account = {
  name: "Meera Iyer",
  email: "meera@pixelcraft.io",
  pendingEmail: null,
  avatarUrl: null,
  timezone: "Asia/Kolkata",
};

export const SECURITY: SecurityState = {
  hasPassword: true,
  passwordChangedAt: now - 74 * DAY_MS,
  twoFactorEnabledAt: null,
  backupCodesRemaining: 0,
  connected: [{ provider: "github", handle: "meera-iyer", linkedAt: now - 300 * DAY_MS }],
};

export const SESSIONS: AuthSession[] = [
  {
    id: "ses_current",
    browser: "Chrome 129",
    os: "macOS 15",
    device: "desktop",
    ip: "49.36.112.18",
    location: "Bengaluru, India",
    createdAt: now - 3 * DAY_MS,
    lastSeenAt: now,
    isCurrent: true,
  },
  {
    id: "ses_phone",
    browser: "Safari 18",
    os: "iOS 18",
    device: "mobile",
    ip: "106.51.72.9",
    location: "Bengaluru, India",
    createdAt: now - 9 * DAY_MS,
    lastSeenAt: now - 40 * MINUTE_MS,
    isCurrent: false,
  },
  {
    id: "ses_linux",
    browser: "Firefox 131",
    os: "Ubuntu 24.04",
    device: "desktop",
    ip: "122.171.19.4",
    location: "Pune, India",
    createdAt: now - 12 * DAY_MS,
    lastSeenAt: now - 2 * DAY_MS - 5 * HOUR_MS,
    isCurrent: false,
  },
  {
    id: "ses_hotel",
    browser: "Edge 129",
    os: "Windows 11",
    device: "desktop",
    ip: "185.220.101.44",
    location: "Frankfurt, Germany",
    createdAt: now - 13 * DAY_MS,
    lastSeenAt: now - 6 * DAY_MS,
    isCurrent: false,
  },
];

export const NOTIFICATION_PREFERENCES: NotificationPreference[] = [
  { type: "monitor_down", inApp: true, email: true, projects: [] },
  { type: "monitor_up", inApp: true, email: false, projects: [] },
  { type: "alert_fired", inApp: true, email: true, projects: [] },
  { type: "incident_created", inApp: true, email: true, projects: [] },
  { type: "incident_updated", inApp: true, email: false, projects: [] },
  { type: "ssl_expiring", inApp: true, email: true, projects: ["pixelcraft"] },
  { type: "invite_accepted", inApp: true, email: false, projects: [] },
  { type: "role_changed", inApp: true, email: true, projects: [] },
];

export const ACCOUNT_ORGANIZATIONS: AccountOrganization[] = [
  {
    id: "org_pixelcraft",
    slug: "pixelcraft",
    name: "Pixelcraft Studio",
    initials: "PS",
    roleId: "role_admin",
    memberCount: 11,
    ownerCount: 1,
    joinedAt: now - 388 * DAY_MS,
  },
  {
    id: "org_bluepeak",
    slug: "bluepeak",
    name: "Bluepeak Agency",
    initials: "BA",
    roleId: "role_editor",
    memberCount: 6,
    ownerCount: 1,
    joinedAt: now - 140 * DAY_MS,
  },
  {
    id: "org_shopnest",
    slug: "shopnest",
    name: "Shopnest",
    initials: "SN",
    roleId: "role_viewer",
    memberCount: 4,
    ownerCount: 1,
    joinedAt: now - 60 * DAY_MS,
  },
  {
    id: "org_meera-labs",
    slug: "meera-labs",
    name: "Meera's side projects",
    initials: "ML",
    roleId: "role_owner",
    memberCount: 3,
    ownerCount: 1,
    joinedAt: now - 30 * DAY_MS,
  },
];
