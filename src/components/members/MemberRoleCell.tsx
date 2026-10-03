import { Tooltip } from "antd";
import { RoleSelect } from "@/components/settings/RoleSelect";
import { RoleTag } from "@/components/settings/RoleTag";
import type { Member } from "@/types/member";
import type { PermissionCheck, Role } from "@/types/rbac";
import { findRole } from "@/lib/members";

type MemberRoleCellProps = {
  member: Member;
  roles: Role[];
  check: PermissionCheck;
  onChange: (role: Role) => void;
};

export function MemberRoleCell({ member, roles, check, onChange }: MemberRoleCellProps) {
  const role = findRole(roles, member.roleId);

  if (!check.allowed) {
    return (
      <Tooltip title={check.reason}>
        <span className="inline-flex">
          <RoleTag role={role} />
        </span>
      </Tooltip>
    );
  }

  return (
    <RoleSelect
      aria-label={`Role for ${member.name}`}
      size="small"
      variant="borderless"
      roles={roles}
      value={member.roleId}
      onChange={(roleId) => {
        const next = findRole(roles, roleId);
        if (next) onChange(next);
      }}
      className="-ml-2 w-40"
    />
  );
}
