export type Organization = {
  slug: string;
  name: string;
  initials: string;
  role: string;
};

export type OrgSettings = {
  name: string;
  slug: string;
  logoUrl: string | null;
  timezone: string;
};

export type NotificationType =
  | "monitor_down"
  | "monitor_up"
  | "alert_fired"
  | "incident_created"
  | "incident_updated"
  | "invite_accepted"
  | "role_changed"
  | "ssl_expiring";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  detail: string;
  project: string | null;
  href: string | null;
  at: number;
  isUnread: boolean;
};
