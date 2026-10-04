import { useMemo } from "react";
import { useParams } from "react-router";
import { findOrganization } from "@/lib/currentOrg";
import { findRole } from "@/lib/members";
import { checkPermission, expandPermissions } from "@/lib/permissions";
import { ROLES } from "@/mocks/team";

export function useCurrentRole() {
  const { orgSlug = "" } = useParams();
  const role = findRole(ROLES, findOrganization(orgSlug).roleId) ?? ROLES[0];
  return useMemo(() => ({ role, granted: expandPermissions(role.permissions) }), [role]);
}

export function usePermission(permission: string) {
  const { role, granted } = useCurrentRole();
  return checkPermission(granted, permission, role.name);
}
