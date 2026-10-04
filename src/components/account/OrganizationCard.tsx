import { Button, Dropdown, Tag, Tooltip } from "antd";
import { LuEllipsis, LuLogOut, LuSettings } from "react-icons/lu";
import { useNavigate } from "react-router";
import { RoleTag } from "@/components/settings/RoleTag";
import { Card } from "@/components/ui/Card";
import { MetaList } from "@/components/ui/MetaList";
import { canLeaveOrganization } from "@/lib/account";
import { formatDay, plural } from "@/lib/format";
import { paths } from "@/lib/paths";
import { checkPermission, expandPermissions } from "@/lib/permissions";
import type { AccountOrganization } from "@/types/account";
import type { Role } from "@/types/rbac";

type OrganizationCardProps = {
  org: AccountOrganization;
  role: Role | undefined;
  isCurrent: boolean;
  onLeave: (org: AccountOrganization) => void;
};

export function OrganizationCard({ org, role, isCurrent, onLeave }: OrganizationCardProps) {
  const navigate = useNavigate();
  const leaveCheck = canLeaveOrganization(org);
  const canOpenSettings =
    role && checkPermission(expandPermissions(role.permissions), "org:settings", role.name).allowed;

  return (
    <li>
      <Card isInteractive>
        <div className="flex flex-wrap items-center gap-4 p-4">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-line bg-hover text-xs font-semibold text-muted"
          >
            {org.initials}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-md font-semibold">{org.name}</span>
              {isCurrent && <Tag className="m-0">Current</Tag>}
            </span>
            <MetaList className="text-xs text-muted">
              <span className="font-mono text-subtle">uptrail.app/o/{org.slug}</span>
              <span>{plural(org.memberCount, "member")}</span>
              <span>joined {formatDay(org.joinedAt)}</span>
            </MetaList>
          </div>
          <RoleTag role={role} />
          <Button onClick={() => navigate(paths.overview(org.slug))}>Open</Button>
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                ...(canOpenSettings
                  ? [
                      {
                        key: "settings",
                        icon: <LuSettings />,
                        label: "Organization settings",
                        onClick: () => navigate(paths.settings(org.slug)),
                      },
                      { type: "divider" as const },
                    ]
                  : []),
                {
                  key: "leave",
                  icon: <LuLogOut />,
                  danger: true,
                  disabled: !leaveCheck.allowed,
                  label: (
                    <Tooltip title={leaveCheck.reason} placement="left">
                      <span>Leave organization</span>
                    </Tooltip>
                  ),
                  onClick: () => onLeave(org),
                },
              ],
            }}
          >
            <Button type="text" aria-label={`More actions for ${org.name}`} icon={<LuEllipsis />} />
          </Dropdown>
        </div>
      </Card>
    </li>
  );
}
