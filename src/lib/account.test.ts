import { describe, expect, it } from "vitest";
import { ACCOUNT_ORGANIZATIONS, NOTIFICATION_PREFERENCES, SECURITY } from "@/mocks/account";
import {
  backupCodeFill,
  canLeaveOrganization,
  canUnlinkProvider,
  generateBackupCodes,
  generateTotpSecret,
  needsSecurityAttention,
} from "./account";
import { applyPreset, countPreferenceChanges, matchingPreset } from "./notifications";

describe("account rules", () => {
  it("blocks unlinking the last sign-in method", () => {
    expect(canUnlinkProvider(SECURITY).allowed).toBe(true);
    expect(canUnlinkProvider({ ...SECURITY, hasPassword: false }).allowed).toBe(false);
  });

  it("blocks the only owner from leaving", () => {
    const owned = ACCOUNT_ORGANIZATIONS.find((org) => org.roleId === "role_owner")!;
    const member = ACCOUNT_ORGANIZATIONS.find((org) => org.roleId !== "role_owner")!;
    expect(canLeaveOrganization(owned).allowed).toBe(false);
    expect(canLeaveOrganization({ ...owned, ownerCount: 2 }).allowed).toBe(true);
    expect(canLeaveOrganization(member).allowed).toBe(true);
  });

  it("colours backup codes by how many are left", () => {
    expect([backupCodeFill(8), backupCodeFill(3), backupCodeFill(1)]).toEqual(["bg-up", "bg-degraded", "bg-down"]);
  });

  it("flags accounts without 2FA", () => {
    expect(needsSecurityAttention(SECURITY)).toBe(true);
    expect(needsSecurityAttention({ ...SECURITY, twoFactorEnabledAt: 1, backupCodesRemaining: 10 })).toBe(false);
  });

  it("generates readable codes and secrets", () => {
    expect(generateBackupCodes(10)).toHaveLength(10);
    expect(generateBackupCodes(1)[0]).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(generateTotpSecret()).toMatch(/^([A-Z2-7]{4} ){3}[A-Z2-7]{4}$/);
  });
});

describe("notification preferences", () => {
  it("applies presets and recognises the matching one", () => {
    const critical = applyPreset(NOTIFICATION_PREFERENCES, "critical");
    expect(matchingPreset(critical)).toBe("critical");
    expect(critical.find((item) => item.type === "monitor_up")).toMatchObject({ inApp: false, email: false });
    expect(countPreferenceChanges(NOTIFICATION_PREFERENCES, critical)).toBeGreaterThan(0);
  });
});
