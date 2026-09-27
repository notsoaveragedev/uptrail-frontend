export type Organization = {
  slug: string;
  name: string;
  initials: string;
  role: string;
};

export type AppNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: "down" | "degraded" | "up" | "info";
  isUnread: boolean;
};
