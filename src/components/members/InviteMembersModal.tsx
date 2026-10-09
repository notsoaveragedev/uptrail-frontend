import { useQuery } from "@tanstack/react-query";
import { Button, Modal, Tag } from "antd";
import { useState } from "react";
import { useParams } from "react-router";
import { invitationsQuery, membersQuery, useSaveInvitation } from "@/api/members";
import { rolesQuery } from "@/api/roles";
import { RoleSelect } from "@/components/settings/RoleSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { useNow } from "@/hooks/useNow";
import { usePlan } from "@/hooks/usePlan";
import { useToast } from "@/hooks/useToast";
import { plural } from "@/lib/format";
import { checkInviteEmails, findRole, newInvitation, seatsUsed } from "@/lib/members";
import { currentUser } from "@/mocks/workspace";

type InviteMembersModalProps = { open: boolean; onClose: () => void };

export function InviteMembersModal({ open, onClose }: InviteMembersModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="Invite members" footer={null} destroyOnHidden width="32rem">
      <InviteForm onClose={onClose} />
    </Modal>
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const save = useSaveInvitation(orgSlug);
  const { data: members = [] } = useQuery(membersQuery(orgSlug));
  const { data: invitations = [] } = useQuery(invitationsQuery(orgSlug));
  const { data: roles = [] } = useQuery(rolesQuery(orgSlug));
  const [emails, setEmails] = useState<string[]>([]);
  const [roleId, setRoleId] = useState("role_viewer");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const now = useNow(60_000);
  const { memberLimit } = usePlan();

  const checks = checkInviteEmails(emails, members, invitations);
  const problems = checks.filter((check) => check.problem);
  const seatsAfter = seatsUsed(members, invitations, now) + emails.length;
  const isOverLimit = memberLimit !== null && seatsAfter > memberLimit;
  const error = isSubmitted
    ? emails.length === 0
      ? "Add at least one email address."
      : problems.length > 0
        ? `Fix ${plural(problems.length, "address")} before sending.`
        : isOverLimit
          ? `Your plan includes ${memberLimit} members. Upgrade to Pro to invite more.`
          : null
    : null;

  function send() {
    setIsSubmitted(true);
    if (emails.length === 0 || problems.length > 0 || isOverLimit) return;
    checks.forEach((check) => save.mutate(newInvitation(check.email, roleId, currentUser.name)));
    const role = findRole(roles, roleId)?.name ?? "";
    toast.success(`${plural(emails.length, "invite")} sent`, `As ${role}. Links expire in 7 days.`);
    onClose();
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <CustomSelect
        label="Email addresses"
        mode="tags"
        autoFocus
        open={false}
        suffixIcon={null}
        tokenSeparators={[",", " ", "\n", ";"]}
        placeholder="name@company.com, or paste a list"
        value={emails}
        onChange={(values) => setEmails(values.map((value) => value.trim().toLowerCase()).filter(Boolean))}
        error={error}
        tagRender={({ value, closable, onClose: removeTag }) => {
          const problem = checks.find((check) => check.email === value)?.problem;
          return (
            <Tag
              closable={closable}
              onClose={removeTag}
              title={problem ?? undefined}
              className={`my-0.5 me-1 font-mono text-xs ${problem ? "border-down/60 bg-down-soft text-down" : ""}`}
            >
              {value}
            </Tag>
          );
        }}
        hint={
          problems.length > 0
            ? problems.map((check) => `${check.email}: ${check.problem}`).join(" · ")
            : memberLimit === null
              ? `${seatsAfter} members after these invites. Your plan has no member limit.`
              : `${seatsAfter} of ${memberLimit} seats after these invites`
        }
      />
      <FieldShell
        label="Role"
        htmlFor="invite-role"
        hint="You can only grant roles with the same or less access than yours."
      >
        <RoleSelect
          id="invite-role"
          size="large"
          roles={roles}
          value={roleId}
          onChange={setRoleId}
          className="w-full"
        />
      </FieldShell>
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={send}>
          {emails.length > 1 ? `Send ${emails.length} invites` : "Send invite"}
        </Button>
      </div>
    </div>
  );
}
