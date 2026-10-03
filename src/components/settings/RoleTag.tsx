import { LuCrown } from "react-icons/lu";
import type { Role } from "@/types/rbac";

export function RoleTag({ role }: { role: Role | undefined }) {
  if (!role) return <span className="text-subtle">—</span>;

  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-sm border px-1.5 text-xs font-medium text-ink ${role.isSystem ? "border-line bg-hover" : "border-dashed border-line-strong"}`}
    >
      {role.key === "owner" && <LuCrown aria-hidden className="size-3 text-degraded" />}
      {role.name}
    </span>
  );
}
