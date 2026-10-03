export type PermissionAction = "read" | "create" | "update" | "delete" | "manage";

export type PermissionResource = {
  key: string;
  label: string;
  actions: Partial<Record<PermissionAction, string>>;
};

export type Role = {
  id: string;
  key: string | null;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  updatedAt: number;
};

export type PermissionCheck = { allowed: boolean; reason: string | null };
