import type { AccountOrganization, AuthSession, OAuthProvider, SecurityState } from "@/types/account";
import type { PermissionCheck } from "@/types/rbac";
import { newId } from "./ids";
import { OWNER_ROLE_ID } from "./members";
import { initials } from "./people";

export const LOW_BACKUP_CODES = 3;

export const BACKUP_CODE_COUNT = 10;

export function canUnlinkProvider(security: SecurityState): PermissionCheck {
  return security.hasPassword || security.connected.length > 1
    ? { allowed: true, reason: null }
    : { allowed: false, reason: "Set a password or connect another provider first, so you can still sign in." };
}

export function canLeaveOrganization(org: AccountOrganization): PermissionCheck {
  return org.roleId === OWNER_ROLE_ID && org.ownerCount === 1
    ? {
        allowed: false,
        reason: "You're the only owner. Transfer ownership or delete the organization in its settings first.",
      }
    : { allowed: true, reason: null };
}

export function deviceLabel(session: AuthSession) {
  return `${session.browser.split(" ")[0]} on ${session.os.split(" ")[0]}`;
}

export function backupCodeFill(remaining: number) {
  if (remaining >= 5) return "bg-up";
  return remaining > 1 ? "bg-degraded" : "bg-down";
}

export function needsSecurityAttention(security: SecurityState) {
  return !security.twoFactorEnabledAt || security.backupCodesRemaining < LOW_BACKUP_CODES;
}

function randomChars(length: number, alphabet: string) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), (byte) => alphabet[byte % alphabet.length]).join(
    "",
  );
}

export function generateBackupCodes(count: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: count }, () => `${randomChars(4, alphabet)}-${randomChars(4, alphabet)}`);
}

export function generateTotpSecret() {
  return randomChars(16, "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567").match(/.{4}/g)!.join(" ");
}

export function totpUri(secret: string, email: string) {
  return `otpauth://totp/Uptrail:${encodeURIComponent(email)}?secret=${secret.replaceAll(" ", "")}&issuer=Uptrail`;
}

export function linkProvider(security: SecurityState, provider: OAuthProvider, handle: string): SecurityState {
  return { ...security, connected: [...security.connected, { provider, handle, linkedAt: Date.now() }] };
}

export function newOrganization(name: string, slug: string): AccountOrganization {
  return {
    id: newId("org"),
    slug,
    name,
    initials: initials(name),
    roleId: OWNER_ROLE_ID,
    memberCount: 1,
    ownerCount: 1,
    joinedAt: Date.now(),
  };
}
