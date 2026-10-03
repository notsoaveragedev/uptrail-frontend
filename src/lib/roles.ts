import type { Role } from "@/types/rbac";
import { expandPermissions } from "./permissions";
import { newId } from "./ids";

export function newRole(name: string, description: string, source: Role | undefined): Role {
  return {
    id: newId("role"),
    key: null,
    name,
    description,
    permissions: source ? [...expandPermissions(source.permissions)] : [],
    isSystem: false,
    updatedAt: Date.now(),
  };
}

export function isRoleNameTaken(name: string, roles: Role[], exceptId?: string) {
  const normalized = name.trim().toLowerCase();
  return roles.some((role) => role.id !== exceptId && role.name.toLowerCase() === normalized);
}

export const BLANK_ROLE = "blank";
