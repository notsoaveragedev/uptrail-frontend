import type { Invitation, Member } from "@/types/member";
import type { Role } from "@/types/rbac";
import { DAY_MS, HOUR_MS } from "@/lib/dates";

const now = Date.now();

const EDITOR_PERMISSIONS = [
  "project:read",
  "monitor:*",
  "dashboard:*",
  "alert:*",
  "incident:*",
  "statuspage:*",
  "member:read",
  "role:read",
];

export const ROLES: Role[] = [
  {
    id: "role_owner",
    key: "owner",
    name: "Owner",
    description: "Everything, including deleting the organization and transferring ownership.",
    permissions: ["*"],
    isSystem: true,
    updatedAt: now - 400 * DAY_MS,
  },
  {
    id: "role_admin",
    key: "admin",
    name: "Admin",
    description: "Everything except deleting the organization and transferring ownership.",
    permissions: [
      "org:settings",
      "member:*",
      "role:*",
      "project:*",
      "monitor:*",
      "dashboard:*",
      "alert:*",
      "incident:*",
      "statuspage:*",
      "apikey:manage",
      "auditlog:view",
      "billing:*",
    ],
    isSystem: true,
    updatedAt: now - 400 * DAY_MS,
  },
  {
    id: "role_editor",
    key: "editor",
    name: "Editor",
    description: "Create and edit monitors, dashboards, alerts, incidents and status pages.",
    permissions: EDITOR_PERMISSIONS,
    isSystem: true,
    updatedAt: now - 400 * DAY_MS,
  },
  {
    id: "role_viewer",
    key: "viewer",
    name: "Viewer",
    description: "Read-only access to monitors, dashboards and incidents.",
    permissions: ["project:read", "monitor:read", "dashboard:read", "incident:read", "statuspage:read", "alert:read"],
    isSystem: true,
    updatedAt: now - 400 * DAY_MS,
  },
  {
    id: "role_billing",
    key: "billing",
    name: "Billing",
    description: "Organization settings and usage only.",
    permissions: ["org:settings", "member:read", "billing:*"],
    isSystem: true,
    updatedAt: now - 400 * DAY_MS,
  },
  {
    id: "role_oncall",
    key: null,
    name: "On-call engineer",
    description: "Responds to incidents and tunes alerts, but can't change monitors.",
    permissions: [
      "project:read",
      "monitor:read",
      "dashboard:read",
      "alert:read",
      "alert:manage",
      "incident:read",
      "incident:create",
      "incident:update",
      "statuspage:read",
      "statuspage:edit",
    ],
    isSystem: false,
    updatedAt: now - 12 * DAY_MS,
  },
  {
    id: "role_client",
    key: null,
    name: "Client viewer",
    description: "For agency clients: sees their project's monitors and status page.",
    permissions: ["project:read", "monitor:read", "statuspage:read", "incident:read"],
    isSystem: false,
    updatedAt: now - 41 * DAY_MS,
  },
];

function member(
  id: string,
  name: string,
  email: string,
  roleId: string,
  joinedDaysAgo: number,
  activeHoursAgo: number,
  projectOverrides: Member["projectOverrides"] = [],
): Member {
  return {
    id,
    name,
    email,
    roleId,
    projectOverrides,
    joinedAt: now - joinedDaysAgo * DAY_MS,
    lastActiveAt: now - activeHoursAgo * HOUR_MS,
  };
}

export const CURRENT_MEMBER_ID = "mem_meera";

export const MEMBERS: Member[] = [
  member("mem_arjun", "Arjun Rao", "arjun@pixelcraft.io", "role_owner", 412, 3),
  member(CURRENT_MEMBER_ID, "Meera Iyer", "meera@pixelcraft.io", "role_admin", 388, 0.05),
  member("mem_kabir", "Kabir Shah", "kabir@pixelcraft.io", "role_editor", 301, 1),
  member("mem_ananya", "Ananya Das", "ananya@pixelcraft.io", "role_editor", 254, 26),
  member("mem_rohan", "Rohan Mehta", "rohan@pixelcraft.io", "role_viewer", 190, 50, [
    { project: "bluepeak", roleId: "role_editor" },
  ]),
  member("mem_priya", "Priya Nair", "priya@pixelcraft.io", "role_billing", 160, 170),
  member("mem_dev", "Dev Patel", "dev@pixelcraft.io", "role_oncall", 122, 5),
  member("mem_ishaan", "Ishaan Gupta", "ishaan@pixelcraft.io", "role_editor", 97, 9, [
    { project: "shopnest", roleId: "role_viewer" },
    { project: "bluepeak", roleId: "role_viewer" },
  ]),
  member("mem_sara", "Sara Khan", "sara@pixelcraft.io", "role_viewer", 64, 340),
  member("mem_lena", "Lena Fischer", "lena@bluepeak.agency", "role_client", 33, 72, [
    { project: "bluepeak", roleId: "role_client" },
  ]),
  member("mem_tom", "Tom Becker", "tom@shopnest.com", "role_client", 12, 20, [
    { project: "shopnest", roleId: "role_client" },
  ]),
];

export const INVITATIONS: Invitation[] = [
  {
    id: "inv_1",
    email: "nikhil@pixelcraft.io",
    roleId: "role_editor",
    invitedBy: "Meera Iyer",
    createdAt: now - 2 * DAY_MS,
    expiresAt: now + 5 * DAY_MS,
  },
  {
    id: "inv_2",
    email: "claire@bluepeak.agency",
    roleId: "role_client",
    invitedBy: "Arjun Rao",
    createdAt: now - 5 * DAY_MS,
    expiresAt: now + 2 * DAY_MS,
  },
  {
    id: "inv_3",
    email: "ops@shopnest.com",
    roleId: "role_viewer",
    invitedBy: "Kabir Shah",
    createdAt: now - 9 * DAY_MS,
    expiresAt: now - 2 * DAY_MS,
  },
];
