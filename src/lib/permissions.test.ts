import { describe, expect, it } from "vitest";
import {
  ALL_PERMISSIONS,
  canGrantRole,
  checkPermission,
  columnState,
  expandPermissions,
  PERMISSION_RESOURCES,
  permissionDiff,
  permissionSummary,
  rowState,
  toggleColumn,
  togglePermission,
  toggleRow,
} from "./permissions";

const monitors = PERMISSION_RESOURCES.find((resource) => resource.key === "monitor")!;
const role = (permissions: string[]) => ({
  id: "r",
  key: null,
  name: "Custom",
  description: "",
  permissions,
  isSystem: false,
  updatedAt: 0,
});

describe("expandPermissions", () => {
  it("expands the global wildcard to every permission", () => {
    expect(expandPermissions(["*"]).size).toBe(ALL_PERMISSIONS.length);
  });

  it("expands a resource wildcard to that resource only", () => {
    expect([...expandPermissions(["monitor:*"])]).toEqual([
      "monitor:read",
      "monitor:create",
      "monitor:update",
      "monitor:delete",
    ]);
  });
});

describe("togglePermission", () => {
  it("turns read on when a dependent action is ticked", () => {
    expect(togglePermission(new Set(), "monitor:update")).toEqual(new Set(["monitor:update", "monitor:read"]));
  });

  it("removes every action in the row when read is unticked", () => {
    const next = togglePermission(new Set(["monitor:read", "monitor:update"]), "monitor:read");
    expect(next.size).toBe(0);
  });
});

describe("row and column toggles", () => {
  it("reports an indeterminate row", () => {
    expect(rowState(new Set(["monitor:read"]), monitors)).toEqual({ checked: false, indeterminate: true });
  });

  it("fills and clears a whole row", () => {
    const full = toggleRow(new Set(), monitors);
    expect(rowState(full, monitors).checked).toBe(true);
    expect(toggleRow(full, monitors).size).toBe(0);
  });

  it("adds the read dependency when a column is turned on", () => {
    const next = toggleColumn(new Set(), "delete");
    expect(columnState(next, "delete").checked).toBe(true);
    expect(next.has("monitor:read")).toBe(true);
  });

  it("clears dependents when the read column is turned off", () => {
    expect(toggleColumn(new Set(ALL_PERMISSIONS), "read").has("monitor:update")).toBe(false);
  });
});

describe("summaries and diffs", () => {
  it("summarises full and partial access in plain words", () => {
    const summary = permissionSummary(new Set(["monitor:read", "monitor:update", "alert:read", "alert:manage"]));
    expect(summary).toEqual([
      { resource: "Monitors", text: "Read and update", isFull: false },
      { resource: "Alerts", text: "Full access", isFull: true },
    ]);
  });

  it("lists added and removed permissions", () => {
    expect(
      permissionDiff(new Set(["monitor:read", "alert:read"]), new Set(["monitor:read", "monitor:update"])),
    ).toEqual({
      added: ["monitor:update"],
      removed: ["alert:read"],
    });
  });
});

describe("checks", () => {
  it("explains a missing permission", () => {
    expect(checkPermission(new Set(), "apikey:manage", "Viewer")).toEqual({
      allowed: false,
      reason: "Your role (Viewer) can't manage API keys.",
    });
  });

  it("blocks granting a role with more access than your own", () => {
    const mine = expandPermissions(["monitor:*"]);
    expect(canGrantRole(mine, role(["monitor:read"])).allowed).toBe(true);
    expect(canGrantRole(mine, role(["*"])).allowed).toBe(false);
  });
});
