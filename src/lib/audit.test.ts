import { describe, expect, it } from "vitest";
import type { AuditEvent } from "@/types/audit";
import { actionTone, auditDiff, describeAuditEvent, filterAuditEvents, readAuditFilters } from "./audit";

const event: AuditEvent = {
  id: "a1",
  actor: { type: "user", name: "Meera Iyer" },
  action: "role.update",
  resource: { type: "role", id: "r1", name: "On-call engineer" },
  project: null,
  before: { permissions: ["incident:read"], name: "On-call" },
  after: { permissions: ["incident:read", "alert:manage"], name: "On-call" },
  ip: "1.2.3.4",
  userAgent: null,
  requestId: "req_abc",
  at: 1_000_000,
};

describe("audit helpers", () => {
  it("describes an event as a sentence", () => {
    expect(describeAuditEvent(event)).toBe("Meera Iyer updated role On-call engineer");
  });

  it("colors destructive and additive actions", () => {
    expect(actionTone("member.remove")).toBe("down");
    expect(actionTone("apikey.create")).toBe("up");
    expect(actionTone("monitor.update")).toBeNull();
  });

  it("diffs every field in before and after", () => {
    expect(auditDiff(event).map((row) => row.field)).toEqual(["permissions", "name"]);
  });

  it("filters by range and request id", () => {
    const filters = readAuditFilters(new URLSearchParams("range=24h&q=req_abc"));
    expect(filterAuditEvents([event], filters, event.at + 1000)).toHaveLength(1);
    expect(filterAuditEvents([event], filters, event.at + 2 * 86_400_000)).toHaveLength(0);
  });
});
