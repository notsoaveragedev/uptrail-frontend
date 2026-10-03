import { describe, expect, it } from "vitest";
import { MEMBERS, ROLES } from "@/mocks/team";
import { expandPermissions } from "./permissions";
import { checkInviteEmails, isLastOwner, memberEditCheck } from "./members";

const admin = expandPermissions(ROLES.find((role) => role.key === "admin")!.permissions);
const owner = MEMBERS.find((member) => member.roleId === "role_owner")!;
const editor = MEMBERS.find((member) => member.roleId === "role_editor")!;

describe("member safeguards", () => {
  it("protects the only owner", () => {
    expect(isLastOwner(owner, MEMBERS)).toBe(true);
    expect(memberEditCheck(owner, MEMBERS, ROLES, admin).allowed).toBe(false);
  });

  it("lets an admin edit an editor", () => {
    expect(memberEditCheck(editor, MEMBERS, ROLES, admin)).toEqual({ allowed: true, reason: null });
  });
});

describe("checkInviteEmails", () => {
  it("flags invalid, duplicate and existing addresses", () => {
    const checks = checkInviteEmails(["new@x.io", "nope", "new@x.io", owner.email], MEMBERS, []);
    expect(checks.map((check) => check.problem)).toEqual([null, "Not a valid email", "Duplicate", "Already a member"]);
  });
});
