import type { IncidentStatus } from "@/types/incident";
import { statusTrail } from "./status";

const TRAIL_LENGTH = 48;
const DENIED_FROM = 36;

export const FORBIDDEN_TRAIL = statusTrail(
  TRAIL_LENGTH,
  "up",
  Object.fromEntries(Array.from({ length: TRAIL_LENGTH - DENIED_FROM }, (_, index) => [DENIED_FROM + index, "down"])),
);

export function forbiddenTimeline(action: string, cause: string): { status: IncidentStatus; note: string }[] {
  return [
    { status: "investigating", note: `Someone tried to ${action}.` },
    { status: "identified", note: `It was you. ${cause}` },
    { status: "monitoring", note: "The permission check is staying by the door. Politely. It doesn't take bribes." },
  ];
}
