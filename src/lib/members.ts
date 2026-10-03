import type { Invitation, Member } from "@/types/member";
import type { PermissionCheck, Role } from "@/types/rbac";
import { DAY_MS } from "./dates";
import { canGrantRole } from "./permissions";
import { readList } from "./searchParams";
import { newId } from "./ids";
import { matchesAny, matchesText } from "./list";

export const MEMBER_TABS = ["members", "invitations"] as const;

export type MemberTab = (typeof MEMBER_TABS)[number];

export const MEMBER_FILTER_KEYS = ["q", "role"];

export const OWNER_ROLE_ID = "role_owner";

export const INHERIT_ROLE = "inherit";

export const LAST_OWNER_REASON = "An organization needs at least one Owner. Transfer ownership first.";

export const INVITE_TTL_MS = 7 * DAY_MS;

export function findRole(roles: Role[], roleId: string) {
  return roles.find((role) => role.id === roleId);
}

export function roleName(roles: Role[], roleId: string) {
  return findRole(roles, roleId)?.name ?? "Unknown role";
}

export function leavesNoOwner(members: Member[], changedIds: string[], nextRoleId: string | null) {
  const owners = members.filter((member) => member.roleId === OWNER_ROLE_ID);
  return nextRoleId !== OWNER_ROLE_ID && owners.length > 0 && owners.every((owner) => changedIds.includes(owner.id));
}

export function pendingInvitations(invitations: Invitation[], now: number) {
  return invitations.filter((invitation) => !isInvitationExpired(invitation, now));
}

export function seatsUsed(members: Member[], invitations: Invitation[], now: number) {
  return members.length + pendingInvitations(invitations, now).length;
}

export function isLastOwner(member: Member, members: Member[]) {
  return member.roleId === OWNER_ROLE_ID && members.filter((item) => item.roleId === OWNER_ROLE_ID).length === 1;
}

export function readMemberFilters(params: URLSearchParams) {
  return { query: params.get("q") ?? "", roles: readList(params, "role") };
}

export function filterMembers(members: Member[], filters: ReturnType<typeof readMemberFilters>) {
  return members.filter(
    (member) => matchesAny(filters.roles, member.roleId) && matchesText(filters.query, member.name, member.email),
  );
}

export function filterInvitations(invitations: Invitation[], filters: ReturnType<typeof readMemberFilters>) {
  return invitations.filter(
    (invitation) => matchesAny(filters.roles, invitation.roleId) && matchesText(filters.query, invitation.email),
  );
}

export function isInvitationExpired(invitation: Invitation, now: number) {
  return invitation.expiresAt <= now;
}

export function newInvitation(email: string, roleId: string, invitedBy: string): Invitation {
  const now = Date.now();
  return {
    id: newId("inv"),
    email,
    roleId,
    invitedBy,
    createdAt: now,
    expiresAt: now + INVITE_TTL_MS,
  };
}

type EmailCheck = { email: string; problem: string | null };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkInviteEmails(emails: string[], members: Member[], invitations: Invitation[]): EmailCheck[] {
  return emails.map((raw, index) => {
    const email = raw.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) return { email, problem: "Not a valid email" };
    if (emails.findIndex((item) => item.trim().toLowerCase() === email) !== index)
      return { email, problem: "Duplicate" };
    if (members.some((member) => member.email === email)) return { email, problem: "Already a member" };
    if (invitations.some((invitation) => invitation.email === email)) return { email, problem: "Already invited" };
    return { email, problem: null };
  });
}

export function membersWithRole(members: Member[], roleId: string) {
  return members.filter(
    (member) => member.roleId === roleId || member.projectOverrides.some((override) => override.roleId === roleId),
  );
}

export function memberEditCheck(
  member: Member,
  members: Member[],
  roles: Role[],
  granted: Set<string>,
): PermissionCheck {
  if (isLastOwner(member, members)) return { allowed: false, reason: LAST_OWNER_REASON };
  const role = findRole(roles, member.roleId);
  if (role && !canGrantRole(granted, role).allowed) {
    return { allowed: false, reason: `${member.name} is ${role.name}, which has more access than your role.` };
  }
  return { allowed: true, reason: null };
}
