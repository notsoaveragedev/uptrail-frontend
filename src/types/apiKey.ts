export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  projects: string[] | null;
  createdBy: string;
  createdAt: number;
  lastUsedAt: number | null;
  lastUsedIp: string | null;
  expiresAt: number | null;
  revokedAt: number | null;
};

export type ApiKeyStatus = "active" | "expired" | "revoked";
