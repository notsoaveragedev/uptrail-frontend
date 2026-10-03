export type Recurrence = {
  freq: "daily" | "weekly";
  weekdays: number[];
  until: number | null;
};

export type MaintenanceWindow = {
  id: string;
  title: string;
  description: string;
  project: string;
  monitorIds: string[];
  startsAt: number;
  endsAt: number;
  timezone: string;
  recurrence: Recurrence | null;
  showOnStatusPage: boolean;
  createdBy: string;
  createdAt: number;
};

export type MaintenancePhase = "active" | "upcoming" | "past";
