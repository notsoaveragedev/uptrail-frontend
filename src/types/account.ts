import type { NotificationType } from "./workspace";

export type Account = {
  name: string;
  email: string;
  pendingEmail: string | null;
  avatarUrl: string | null;
  timezone: string;
};

export type AuthSession = {
  id: string;
  browser: string;
  os: string;
  device: "desktop" | "mobile";
  ip: string;
  location: string;
  createdAt: number;
  lastSeenAt: number;
  isCurrent: boolean;
};

export type OAuthProvider = "google" | "github";

export type ConnectedAccount = { provider: OAuthProvider; handle: string; linkedAt: number };

export type SecurityState = {
  hasPassword: boolean;
  passwordChangedAt: number;
  twoFactorEnabledAt: number | null;
  backupCodesRemaining: number;
  connected: ConnectedAccount[];
};

export type NotificationPreference = {
  type: NotificationType;
  inApp: boolean;
  email: boolean;
  projects: string[];
};

export type AccountOrganization = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  roleId: string;
  memberCount: number;
  ownerCount: number;
  joinedAt: number;
};
