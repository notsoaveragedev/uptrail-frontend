import { describe, expect, it } from "vitest";
import type { MaintenanceWindow } from "@/types/maintenance";
import { DAY_MS, HOUR_MS } from "./dates";
import { maintenancePhase, nextOccurrences, occurrences, overlapping } from "./maintenance";

const monday = new Date(2026, 9, 5, 2, 0).getTime();

function windowAt(fields: Partial<MaintenanceWindow>): MaintenanceWindow {
  return {
    id: "m1",
    title: "Patch",
    description: "",
    project: "pixelcraft",
    monitorIds: ["mon_a"],
    startsAt: monday,
    endsAt: monday + HOUR_MS,
    timezone: "UTC",
    recurrence: null,
    showOnStatusPage: false,
    createdBy: "",
    createdAt: 0,
    ...fields,
  };
}

describe("occurrences", () => {
  it("returns a one-off window only when it overlaps the range", () => {
    expect(occurrences(windowAt({}), monday - DAY_MS, monday + DAY_MS)).toHaveLength(1);
    expect(occurrences(windowAt({}), monday + DAY_MS, monday + 2 * DAY_MS)).toHaveLength(0);
  });

  it("expands weekly windows on the chosen weekdays", () => {
    const weekly = windowAt({ recurrence: { freq: "weekly", weekdays: [1, 3], until: null } });
    const days = occurrences(weekly, monday, monday + 14 * DAY_MS).map((item) => new Date(item.start).getDay());
    expect(days).toEqual([1, 3, 1, 3]);
  });

  it("stops daily windows at the until date", () => {
    const daily = windowAt({ recurrence: { freq: "daily", weekdays: [], until: monday + 2 * DAY_MS } });
    expect(occurrences(daily, monday, monday + 10 * DAY_MS)).toHaveLength(3);
  });
});

describe("phases", () => {
  it("classifies active, upcoming and past windows", () => {
    expect(maintenancePhase(windowAt({}), monday + HOUR_MS / 2)).toBe("active");
    expect(maintenancePhase(windowAt({}), monday - HOUR_MS)).toBe("upcoming");
    expect(maintenancePhase(windowAt({}), monday + 2 * HOUR_MS)).toBe("past");
  });

  it("finds the next occurrence of a recurring window", () => {
    const daily = windowAt({ recurrence: { freq: "daily", weekdays: [], until: null } });
    expect(nextOccurrences(daily, monday + 2 * HOUR_MS, 1)[0].start).toBe(monday + DAY_MS);
  });
});

describe("overlapping", () => {
  it("flags another window that covers the same monitor at the same time", () => {
    const other = windowAt({ id: "m2", startsAt: monday + HOUR_MS / 2, endsAt: monday + 2 * HOUR_MS });
    expect(overlapping(windowAt({}), [other])).toEqual([other]);
    expect(overlapping(windowAt({ monitorIds: ["mon_b"] }), [other])).toEqual([]);
  });
});

describe("long-running and far-future windows", () => {
  it("keeps finding occurrences for a weekly window created long ago", () => {
    const old = windowAt({
      startsAt: monday - 600 * DAY_MS,
      endsAt: monday - 600 * DAY_MS + HOUR_MS,
      recurrence: { freq: "weekly", weekdays: [1], until: null },
    });
    expect(maintenancePhase(old, monday + 2 * HOUR_MS)).toBe("upcoming");
    expect(nextOccurrences(old, monday + 2 * HOUR_MS, 1)[0].start).toBe(monday + 7 * DAY_MS);
  });

  it("treats a one-off window months away as upcoming", () => {
    const later = windowAt({ startsAt: monday + 200 * DAY_MS, endsAt: monday + 200 * DAY_MS + HOUR_MS });
    expect(maintenancePhase(later, monday)).toBe("upcoming");
  });
});
