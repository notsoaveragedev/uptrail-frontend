import type { PermissionAction, PermissionCheck, PermissionResource, Role } from "@/types/rbac";

export const PERMISSION_ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: "read", label: "Read" },
  { key: "create", label: "Create" },
  { key: "update", label: "Update" },
  { key: "delete", label: "Delete" },
  { key: "manage", label: "Manage" },
];

export const PERMISSION_RESOURCES: PermissionResource[] = [
  {
    key: "project",
    label: "Projects",
    actions: { read: "project:read", create: "project:create", update: "project:update", delete: "project:delete" },
  },
  {
    key: "monitor",
    label: "Monitors",
    actions: { read: "monitor:read", create: "monitor:create", update: "monitor:update", delete: "monitor:delete" },
  },
  {
    key: "dashboard",
    label: "Dashboards",
    actions: { read: "dashboard:read", update: "dashboard:edit", delete: "dashboard:delete" },
  },
  { key: "alert", label: "Alerts", actions: { read: "alert:read", manage: "alert:manage" } },
  {
    key: "incident",
    label: "Incidents",
    actions: { read: "incident:read", create: "incident:create", update: "incident:update" },
  },
  {
    key: "statuspage",
    label: "Status pages",
    actions: { read: "statuspage:read", update: "statuspage:edit", manage: "statuspage:publish" },
  },
  {
    key: "member",
    label: "Members",
    actions: { read: "member:read", create: "member:invite", update: "member:update", delete: "member:remove" },
  },
  { key: "role", label: "Roles", actions: { read: "role:read", manage: "role:manage" } },
  { key: "apikey", label: "API keys", actions: { manage: "apikey:manage" } },
  { key: "auditlog", label: "Audit log", actions: { read: "auditlog:view" } },
  {
    key: "org",
    label: "Org settings",
    actions: { update: "org:settings", delete: "org:delete", manage: "org:transfer" },
  },
];

export const ALL_PERMISSIONS = PERMISSION_RESOURCES.flatMap((resource) => Object.values(resource.actions));

const PERMISSION_LABELS: Record<string, string> = {
  "org:settings": "edit org settings",
  "org:delete": "delete the organization",
  "org:transfer": "transfer ownership",
  "member:invite": "invite members",
  "member:update": "change member roles",
  "member:remove": "remove members",
  "role:manage": "manage roles",
  "apikey:manage": "manage API keys",
  "auditlog:view": "view the audit log",
  "alert:manage": "manage alert rules",
  "statuspage:publish": "publish status pages",
  "statuspage:edit": "edit status pages",
  "dashboard:edit": "edit dashboards",
};

export function permissionLabel(permission: string) {
  if (PERMISSION_LABELS[permission]) return PERMISSION_LABELS[permission];
  const [resourceKey, action] = permission.split(":");
  const resource = PERMISSION_RESOURCES.find((item) => item.key === resourceKey);
  return `${action} ${resource?.label.toLowerCase() ?? resourceKey}`;
}

export function expandPermissions(permissions: string[]) {
  return new Set(
    permissions.flatMap((permission) => {
      if (permission === "*") return ALL_PERMISSIONS;
      if (permission.endsWith(":*")) {
        const resource = permission.slice(0, -2);
        return ALL_PERMISSIONS.filter((key) => key.startsWith(`${resource}:`));
      }
      return [permission];
    }),
  );
}

export function checkPermission(granted: Set<string>, permission: string, roleName: string): PermissionCheck {
  return granted.has(permission)
    ? { allowed: true, reason: null }
    : { allowed: false, reason: `Your role (${roleName}) can't ${permissionLabel(permission)}.` };
}

function resourceOf(permission: string) {
  return PERMISSION_RESOURCES.find((resource) => Object.values(resource.actions).includes(permission));
}

export function requiredBy(permission: string) {
  const resource = resourceOf(permission);
  const read = resource && resource.actions.read;
  return read && read !== permission ? read : null;
}

export function togglePermission(selected: Set<string>, permission: string) {
  const next = new Set(selected);
  if (next.has(permission)) {
    next.delete(permission);
    const resource = resourceOf(permission);
    if (resource && resource.actions.read === permission) {
      Object.values(resource.actions).forEach((key) => next.delete(key));
    }
    return next;
  }
  next.add(permission);
  const read = requiredBy(permission);
  if (read) next.add(read);
  return next;
}

type ToggleState = { checked: boolean; indeterminate: boolean };

function stateOf(selected: Set<string>, keys: string[]): ToggleState {
  const count = keys.filter((key) => selected.has(key)).length;
  return { checked: keys.length > 0 && count === keys.length, indeterminate: count > 0 && count < keys.length };
}

function setAll(selected: Set<string>, keys: string[], isOn: boolean) {
  const next = new Set(selected);
  keys.forEach((key) => (isOn ? next.add(key) : next.delete(key)));
  if (!isOn) return next;
  for (const key of keys) {
    const read = requiredBy(key);
    if (read) next.add(read);
  }
  return next;
}

function within(keys: string[], allowed?: Set<string>) {
  return allowed ? keys.filter((key) => allowed.has(key)) : keys;
}

function columnKeys(action: PermissionAction, allowed?: Set<string>) {
  return within(
    PERMISSION_RESOURCES.flatMap((resource) => resource.actions[action] ?? []),
    allowed,
  );
}

function rowKeys(resource: PermissionResource, allowed?: Set<string>) {
  return within(Object.values(resource.actions), allowed);
}

export function rowState(selected: Set<string>, resource: PermissionResource, allowed?: Set<string>) {
  return stateOf(selected, rowKeys(resource, allowed));
}

export function columnState(selected: Set<string>, action: PermissionAction, allowed?: Set<string>) {
  return stateOf(selected, columnKeys(action, allowed));
}

export function toggleRow(selected: Set<string>, resource: PermissionResource, allowed?: Set<string>) {
  return setAll(selected, rowKeys(resource, allowed), !rowState(selected, resource, allowed).checked);
}

export function toggleColumn(selected: Set<string>, action: PermissionAction, allowed?: Set<string>) {
  const keys = columnKeys(action, allowed);
  const isOn = !columnState(selected, action, allowed).checked;
  if (isOn || action !== "read") return setAll(selected, keys, isOn);
  return PERMISSION_RESOURCES.reduce(
    (next, resource) => (resource.actions.read ? setAll(next, rowKeys(resource), false) : next),
    new Set(selected),
  );
}

export function permissionSummary(selected: Set<string>) {
  return PERMISSION_RESOURCES.flatMap((resource) => {
    const granted = PERMISSION_ACTIONS.flatMap(({ key }) => resource.actions[key] ?? []).filter((permission) =>
      selected.has(permission),
    );
    if (granted.length === 0) return [];
    const isFull = granted.length === rowKeys(resource).length;
    const verbs = granted.map((permission) => permissionLabel(permission).split(" ")[0]);
    return [{ resource: resource.label, text: isFull ? "Full access" : sentenceList(verbs), isFull }];
  });
}

function sentenceList(words: string[]) {
  const capitalized = words.map((word, index) => (index === 0 ? word[0].toUpperCase() + word.slice(1) : word));
  if (capitalized.length < 2) return capitalized.join("");
  return `${capitalized.slice(0, -1).join(", ")} and ${capitalized.at(-1)}`;
}

export function permissionDiff(before: Set<string>, after: Set<string>) {
  return {
    added: ALL_PERMISSIONS.filter((key) => after.has(key) && !before.has(key)),
    removed: ALL_PERMISSIONS.filter((key) => before.has(key) && !after.has(key)),
  };
}

export function canGrantRole(granted: Set<string>, role: Role): PermissionCheck {
  const missing = [...expandPermissions(role.permissions)].filter((key) => !granted.has(key));
  return missing.length === 0
    ? { allowed: true, reason: null }
    : {
        allowed: false,
        reason: `${role.name} has permissions your role doesn't, like ${permissionLabel(missing[0])}.`,
      };
}
