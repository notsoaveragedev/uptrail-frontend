import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { membersQuery, useRemoveMembers, useRevokeInvitations, useSaveInvitation, useSaveMember } from "@/api/members";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { plural } from "@/lib/format";
import { shortName } from "@/lib/people";
import { INVITE_TTL_MS, leavesNoOwner } from "@/lib/members";
import { CURRENT_MEMBER_ID } from "@/mocks/team";
import type { Invitation, Member } from "@/types/member";
import type { Role } from "@/types/rbac";

export function useMemberActions() {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const saveMember = useSaveMember(orgSlug);
  const removeMembers = useRemoveMembers(orgSlug);
  const saveInvitation = useSaveInvitation(orgSlug);
  const revokeInvitations = useRevokeInvitations(orgSlug);
  const { data: allMembers = [] } = useQuery(membersQuery(orgSlug));

  function blockLastOwner(ids: string[], nextRoleId: string | null) {
    if (!leavesNoOwner(allMembers, ids, nextRoleId)) return false;
    toast.error("An organization needs at least one Owner", "Transfer ownership before changing the last Owner.");
    return true;
  }

  async function changeRole(members: Member[], role: Role) {
    const changed = members.filter((member) => member.roleId !== role.id);
    if (
      changed.length === 0 ||
      blockLastOwner(
        changed.map((member) => member.id),
        role.id,
      )
    )
      return false;
    if (changed.some((member) => member.id === CURRENT_MEMBER_ID)) {
      const isConfirmed = await confirm({
        title: `Change your own role to ${role.name}?`,
        description: "You may lose access to settings you can see now, including this page.",
        confirmLabel: "Change my role",
        isDanger: true,
      });
      if (!isConfirmed) return false;
    }
    changed.forEach((member) => saveMember.mutate({ ...member, roleId: role.id }));
    const title =
      changed.length === 1
        ? `${shortName(changed[0].name)} is now ${role.name}`
        : `${plural(changed.length, "member")} are now ${role.name}`;
    toast.success(title, undefined, {
      label: "Undo",
      onClick: () => changed.forEach((member) => saveMember.mutate(member)),
    });
    return true;
  }

  async function remove(members: Member[]) {
    if (
      blockLastOwner(
        members.map((member) => member.id),
        null,
      )
    )
      return false;
    const isConfirmed = await confirm({
      title: members.length === 1 ? `Remove ${members[0].name}?` : `Remove ${plural(members.length, "member")}?`,
      description: "They lose access right away. Their monitors, dashboards and incident history stay.",
      confirmLabel: "Remove",
      isDanger: true,
    });
    if (!isConfirmed) return false;
    removeMembers.mutate(members.map((member) => member.id));
    toast.success(
      members.length === 1 ? `${members[0].name} removed` : `${plural(members.length, "member")} removed`,
      undefined,
      {
        label: "Undo",
        onClick: () => members.forEach((member) => saveMember.mutate(member)),
      },
    );
    return true;
  }

  async function revoke(invitation: Invitation) {
    const isConfirmed = await confirm({
      title: `Revoke the invite for ${invitation.email}?`,
      description: "The invite link stops working. You can invite them again later.",
      confirmLabel: "Revoke",
      isDanger: true,
    });
    if (!isConfirmed) return;
    revokeInvitations.mutate([invitation.id]);
    toast.success("Invite revoked", invitation.email, {
      label: "Undo",
      onClick: () => saveInvitation.mutate(invitation),
    });
  }

  function resend(invitation: Invitation) {
    const now = Date.now();
    saveInvitation.mutate({ ...invitation, createdAt: now, expiresAt: now + INVITE_TTL_MS });
    toast.success("Invite resent", `${invitation.email} has a new link that expires in 7 days.`);
  }

  return { changeRole, remove, revoke, resend, saveMember };
}
