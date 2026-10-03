import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { ListTabs } from "@/components/ui/ListTabs";
import { ToolbarDivider } from "@/components/ui/ToolbarDivider";
import { useMemberFilters } from "@/hooks/useMemberFilters";
import { countBy } from "@/lib/list";
import type { Invitation, Member } from "@/types/member";
import type { Role } from "@/types/rbac";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";

type MembersToolbarProps = {
  members: Member[];
  invitations: Invitation[];
  roles: Role[];
};

export function MembersToolbar({ members, invitations, roles }: MembersToolbarProps) {
  const { tab, filters, hasFilters, setTab, setParam, clear } = useMemberFilters();
  const roleCounts = countBy<Member | Invitation>(tab === "members" ? members : invitations, (item) => item.roleId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ListTabs
        label="Members or invitations"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "members", label: "Members", count: members.length },
          { value: "invitations", label: "Invitations", count: invitations.length },
        ]}
      />
      <ToolbarDivider />
      <FacetFilter
        label="Role"
        selected={filters.roles}
        onChange={(values) => setParam("role", values)}
        options={roles.map((role) => ({ value: role.id, label: role.name, count: roleCounts[role.id] }))}
      />
      <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
      <ToolbarSearch
        label="Search members"
        placeholder="Search by name or email"
        value={filters.query}
        onChange={(value) => setParam("q", value)}
      />
    </div>
  );
}
