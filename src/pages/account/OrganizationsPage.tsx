import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { LuBuilding2, LuPlus } from "react-icons/lu";
import { accountOrganizationsQuery, useLeaveOrganizations } from "@/api/account";
import { rolesQuery } from "@/api/roles";
import { CreateOrganizationModal } from "@/components/account/CreateOrganizationModal";
import { OrganizationCard } from "@/components/account/OrganizationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useLazyDisclosure } from "@/hooks/useLazyDisclosure";
import { useLeaveOrganization } from "@/hooks/useLeaveOrganization";
import { lastOrg } from "@/lib/currentOrg";
import { findRole } from "@/lib/members";
import type { AccountOrganization } from "@/types/account";

export function OrganizationsPage() {
  const { data: organizations } = useQuery(accountOrganizationsQuery);
  const currentSlug = lastOrg().slug;
  const { data: roles = [] } = useQuery(rolesQuery(currentSlug));
  const create = useLazyDisclosure();
  const leave = useLeaveOrganization();
  const removeOrgs = useLeaveOrganizations();

  function leaveOrganization(org: AccountOrganization) {
    leave(org.name, { isLastOrg: organizations?.length === 1, onLeft: () => removeOrgs.mutate([org.id]) });
  }

  return (
    <>
      <title>Organizations · Account · Uptrail</title>
      <PageHeader
        level={2}
        title="Organizations"
        meta="Organizations you belong to and your role in each."
        actions={
          <Button type="primary" icon={<LuPlus />} onClick={create.open}>
            New organization
          </Button>
        }
      />
      {!organizations && (
        <div aria-busy className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonBlock key={index} className="h-20 border border-line" />
          ))}
        </div>
      )}
      {organizations?.length === 0 && (
        <div className="rounded-lg border border-line bg-card">
          <EmptyState
            icon={<LuBuilding2 />}
            title="You're not in any organization yet"
            description="Create one, or check your email for an invite."
            action={<Button onClick={create.open}>New organization</Button>}
          />
        </div>
      )}
      {organizations && organizations.length > 0 && (
        <ul className="flex flex-col gap-3">
          {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              org={org}
              role={findRole(roles, org.roleId)}
              isCurrent={org.slug === currentSlug}
              onLeave={leaveOrganization}
            />
          ))}
        </ul>
      )}
      {create.hasOpened && <CreateOrganizationModal open={create.isOpen} onClose={create.close} />}
    </>
  );
}
