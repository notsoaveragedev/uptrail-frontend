import type { ReactNode } from "react";
import { ForbiddenScreen } from "@/components/errors/ForbiddenScreen";
import { usePermission } from "@/hooks/usePermission";

type RequirePermissionProps = { permission: string; children: ReactNode };

export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const check = usePermission(permission);
  return check.allowed ? children : <ForbiddenScreen permission={permission} />;
}
