import type { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";

export function Can({ permission, children }: { permission: string; children: ReactNode }) {
  return usePermission(permission).allowed ? children : null;
}
