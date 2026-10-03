import { useMemo } from "react";
import { useParams } from "react-router";
import { checkPermission, expandPermissions } from "@/lib/permissions";
import { ROLES } from "@/mocks/team";
import { organizations } from "@/mocks/workspace";

export function useCurrentRole() {
  const { orgSlug = "" } = useParams();
  const org = organizations.find((item) => item.slug === orgSlug) ?? organizations[0];
  const role = ROLES.find((item) => item.name === org.role) ?? ROLES[0];
  return useMemo(() => ({ role, granted: expandPermissions(role.permissions) }), [role]);
}

export function usePermission(permission: string) {
  const { role, granted } = useCurrentRole();
  return checkPermission(granted, permission, role.name);
}
