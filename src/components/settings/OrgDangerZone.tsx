import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useNavigate, useParams } from "react-router";
import { membersQuery } from "@/api/members";
import { monitorsQuery } from "@/api/monitors";
import { statusPagesQuery } from "@/api/statusPages";
import { DangerRow, DangerZone } from "@/components/ui/DangerZone";
import { useLeaveOrganization } from "@/hooks/useLeaveOrganization";
import { usePermission } from "@/hooks/usePermission";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import { OWNER_ROLE_ID } from "@/lib/members";
import { paths } from "@/lib/paths";
import { plural } from "@/lib/format";

type OrgDangerZoneProps = { orgName: string; orgSlug: string };

export function OrgDangerZone({ orgName, orgSlug }: OrgDangerZoneProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const leave = useLeaveOrganization();
  const confirm = useConfirm();
  const { orgSlug: routeSlug = "" } = useParams();
  const canDelete = usePermission("org:delete");
  const canTransfer = usePermission("org:transfer");
  const { data: monitors = [] } = useQuery(monitorsQuery(routeSlug));
  const { data: pages = [] } = useQuery(statusPagesQuery(routeSlug));
  const { data: members = [] } = useQuery(membersQuery(routeSlug));
  const owners = members.filter((member) => member.roleId === OWNER_ROLE_ID).map((member) => member.name);

  async function deleteOrg() {
    const isConfirmed = await confirm({
      title: `Delete ${orgName}?`,
      description: "This can't be undone. Everything in the organization is deleted for every member.",
      isDanger: true,
      typeToConfirm: {
        expected: orgSlug,
        consequences: [
          plural(monitors.length, "monitor") + " and all check history",
          plural(pages.length, "status page") + " and their subscribers",
          plural(members.length, "member") + " lose access",
        ],
      },
      confirmLabel: "Delete organization",
    });
    if (!isConfirmed) return;
    toast.success(`${orgName} scheduled for deletion`, "You have 7 days to restore it from your account page.");
  }

  if (!canDelete.allowed) {
    return (
      <div className="flex flex-col gap-2">
        <DangerZone>
          <DangerRow
            title="Leave organization"
            description="Remove yourself from this organization."
            action={
              <Button danger size="small" onClick={() => leave(orgName)}>
                Leave
              </Button>
            }
          />
        </DangerZone>
        <p className="text-xs text-subtle">
          Only Owners can transfer ownership or delete the organization
          {owners.length > 0 && ` · ask ${owners.join(", ")}`}.
        </p>
      </div>
    );
  }

  return (
    <DangerZone>
      {canTransfer.allowed && (
        <DangerRow
          title="Transfer ownership"
          description="Make another member the Owner. You become an Admin."
          action={
            <Button danger size="small" onClick={() => navigate(paths.settings(routeSlug, "members"))}>
              Transfer
            </Button>
          }
        />
      )}
      <DangerRow
        title="Delete organization"
        description="Deletes every monitor, dashboard, status page and member."
        action={
          <Button danger type="primary" size="small" onClick={deleteOrg}>
            Delete
          </Button>
        }
      />
    </DangerZone>
  );
}
