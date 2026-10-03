import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { lazy, Suspense, useState } from "react";
import { LuMailPlus, LuUserPlus, LuUsers } from "react-icons/lu";
import { useParams } from "react-router";
import { invitationsQuery, membersQuery } from "@/api/members";
import { rolesQuery } from "@/api/roles";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { InvitationsTable } from "@/components/members/InvitationsTable";
import { MemberBulkBar } from "@/components/members/MemberBulkBar";
import { MembersTable } from "@/components/members/MembersTable";
import { MembersToolbar } from "@/components/members/MembersToolbar";
import { OverridesModal } from "@/components/members/OverridesModal";
import { Can } from "@/components/rbac/Can";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMemberFilters } from "@/hooks/useMemberFilters";
import { useNow } from "@/hooks/useNow";
import { importWithReload } from "@/lib/lazyPage";
import { filterInvitations, filterMembers, OWNER_ROLE_ID, pendingInvitations, seatsUsed } from "@/lib/members";
import { SEAT_LIMIT } from "@/mocks/workspace";
import type { Invitation, Member } from "@/types/member";
import type { Role } from "@/types/rbac";

const InviteMembersModal = lazy(() =>
  importWithReload(() => import("@/components/members/InviteMembersModal")).then((module) => ({
    default: module.InviteMembersModal,
  })),
);

const COLUMNS = ["w-4", "flex-1", "w-28", "w-20", "w-16", "w-16", "w-6"];

export function MembersPage() {
  const { orgSlug = "" } = useParams();
  const { data: members } = useQuery(membersQuery(orgSlug));
  const { data: invitations } = useQuery(invitationsQuery(orgSlug));
  const { data: roles } = useQuery(rolesQuery(orgSlug));
  const [isInviting, setIsInviting] = useState(false);
  const [hasOpenedInvite, setHasOpenedInvite] = useState(false);

  function openInvite() {
    setHasOpenedInvite(true);
    setIsInviting(true);
  }

  return (
    <>
      <title>Members · Settings · Uptrail</title>
      <PageHeader
        level={2}
        title="Members"
        meta={members && invitations && <MembersSummary members={members} invitations={invitations} />}
        actions={
          <Can permission="member:invite">
            <Button type="primary" icon={<LuUserPlus />} onClick={openInvite}>
              Invite members
            </Button>
          </Can>
        }
      />
      {members && invitations && roles ? (
        <MembersView members={members} invitations={invitations} roles={roles} onInvite={openInvite} />
      ) : (
        <TableSkeleton columns={COLUMNS} />
      )}
      <Suspense fallback={null}>
        {hasOpenedInvite && <InviteMembersModal open={isInviting} onClose={() => setIsInviting(false)} />}
      </Suspense>
    </>
  );
}

function MembersSummary({ members, invitations }: { members: Member[]; invitations: Invitation[] }) {
  const now = useNow(60_000);
  const pending = pendingInvitations(invitations, now).length;
  const owners = members.filter((member) => member.roleId === OWNER_ROLE_ID).length;

  return (
    <MetaList>
      <span>
        <span className="font-mono text-ink">{members.length}</span> members
      </span>
      <span>
        <span className="font-mono text-ink">{pending}</span> pending invites
      </span>
      <span>
        <span className="font-mono text-ink">{owners}</span> {owners === 1 ? "owner" : "owners"}
      </span>
      <span>
        <span className="font-mono text-ink">{seatsUsed(members, invitations, now)}</span> of {SEAT_LIMIT} seats used
      </span>
    </MetaList>
  );
}

type MembersViewProps = {
  members: Member[];
  invitations: Invitation[];
  roles: Role[];
  onInvite: () => void;
};

function MembersView({ members, invitations, roles, onInvite }: MembersViewProps) {
  const { tab, filters, hasFilters, clear } = useMemberFilters();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [overridesFor, setOverridesFor] = useState<Member | null>(null);
  const visibleMembers = filterMembers(members, filters);
  const selected = visibleMembers.filter((member) => selectedIds.includes(member.id));

  const filteredEmpty = <EmptyState icon={<LuUsers />} title="No one matches these filters" onClear={clear} />;

  return (
    <div className="flex flex-col gap-3 pb-20">
      <MembersToolbar members={members} invitations={invitations} roles={roles} />
      <SectionErrorBoundary>
        {tab === "members" ? (
          <MembersTable
            members={visibleMembers}
            allMembers={members}
            roles={roles}
            selectedIds={selected.map((member) => member.id)}
            onSelect={setSelectedIds}
            onManageOverrides={setOverridesFor}
            emptyText={filteredEmpty}
          />
        ) : (
          <InvitationsTable
            invitations={filterInvitations(invitations, filters)}
            roles={roles}
            emptyText={
              hasFilters ? (
                filteredEmpty
              ) : (
                <EmptyState
                  icon={<LuMailPlus />}
                  title="No pending invitations"
                  description="Invite teammates or clients. Links expire after 7 days."
                  action={
                    <Can permission="member:invite">
                      <Button onClick={onInvite}>Invite members</Button>
                    </Can>
                  }
                />
              )
            }
          />
        )}
      </SectionErrorBoundary>
      <MemberBulkBar selected={selected} roles={roles} onClear={() => setSelectedIds([])} />
      <OverridesModal member={overridesFor} roles={roles} onClose={() => setOverridesFor(null)} />
    </div>
  );
}
