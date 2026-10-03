import type { ApiKey, ApiKeyStatus } from "@/types/apiKey";
import { DAY_MS } from "./dates";
import { readList } from "./searchParams";
import { matchesAny, matchesText } from "./list";

export const API_KEY_TABS = ["active", "inactive"] as const;

export type ApiKeyTab = (typeof API_KEY_TABS)[number];

export const API_KEY_FILTER_KEYS = ["q", "project", "creator"];

export const EXPIRY_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
  { value: "never", label: "Never" },
];

export const SCOPE_PRESETS = {
  read: ["project:read", "monitor:read", "dashboard:read", "alert:read", "incident:read", "statuspage:read"],
  monitors: ["project:read", "monitor:read", "monitor:create", "monitor:update", "monitor:delete"],
};

export function apiKeyStatus(key: ApiKey, now: number): ApiKeyStatus {
  if (key.revokedAt) return "revoked";
  return key.expiresAt !== null && key.expiresAt <= now ? "expired" : "active";
}

export function readApiKeyFilters(params: URLSearchParams) {
  return { query: params.get("q") ?? "", projects: readList(params, "project"), creators: readList(params, "creator") };
}

export function filterApiKeys(
  keys: ApiKey[],
  tab: ApiKeyTab,
  filters: ReturnType<typeof readApiKeyFilters>,
  now: number,
) {
  return keys.filter(
    (key) =>
      (apiKeyStatus(key, now) === "active") === (tab === "active") &&
      matchesAny(filters.creators, key.createdBy) &&
      matchesAny(filters.projects, key.projects ?? []) &&
      matchesText(filters.query, key.name, key.prefix),
  );
}

function randomToken(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => "abcdefghijklmnopqrstuvwxyz0123456789"[byte % 36]).join("");
}

export function createApiKey(
  values: { name: string; permissions: string[]; projects: string[]; expiry: string },
  createdBy: string,
) {
  const now = Date.now();
  const prefix = `upt_live_${randomToken(4)}`;
  const key: ApiKey = {
    id: `key_${randomToken(8)}`,
    name: values.name,
    prefix,
    permissions: values.permissions,
    projects: values.projects.length ? values.projects : null,
    createdBy,
    createdAt: now,
    lastUsedAt: null,
    lastUsedIp: null,
    expiresAt: values.expiry === "never" ? null : now + Number(values.expiry) * DAY_MS,
    revokedAt: null,
  };
  return { key, secret: `${prefix}_${randomToken(32)}` };
}
