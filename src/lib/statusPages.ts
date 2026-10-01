import type { Monitor } from "@/types/monitor";
import type {
  StatusComponentConfig,
  StatusGroupConfig,
  SnapshotDay,
  StatusPage,
  StatusSnapshot,
  StatusSubscriber,
  StatusTheme,
} from "@/types/statusPage";
import { csvRow } from "./csv";
import { PROJECT_OPTIONS } from "./monitors";
import type { Tone } from "./status";
import { contrastRatio, isDarkColor, MIN_PRIMARY_CONTRAST, MIN_TEXT_CONTRAST, suggestReadable } from "./statusTheme";

export const STATUS_HOST = "uptrail.app";
export const STATUS_ORIGIN = `https://${STATUS_HOST}`;
export const CNAME_TARGET = "pages.uptrail.app";
export const HISTORY_DAY_OPTIONS = [30, 60, 90];
export const MODE_OPTIONS = [
  { value: "light" as const, label: "Light" },
  { value: "dark" as const, label: "Dark" },
  { value: "auto" as const, label: "Auto" },
];

export const COLOR_PRESETS = {
  primary: ["#C2410C", "#2563EB", "#0F766E", "#7C3AED", "#BE123C", "#16171A"],
  background: ["#FFFFFF", "#F7F7F5", "#F8FAFC", "#FFFBF5", "#0E0F11", "#111827"],
  text: ["#16171A", "#1F2937", "#334155", "#FFFFFF", "#ECEDEF", "#E5E7EB"],
};

export const BADGE_FORMAT_OPTIONS = [
  { value: "markdown" as const, label: "Markdown" },
  { value: "html" as const, label: "HTML" },
  { value: "url" as const, label: "URL" },
];

const RESERVED_SLUGS = ["admin", "api", "app", "status", "www", "uptrail"];

export function pageAddress(page: Pick<StatusPage, "slug" | "customDomain">) {
  return page.customDomain?.verified ? page.customDomain.host : `${STATUS_HOST}/status/${page.slug}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function isSlugTaken(slug: string, pages: StatusPage[]) {
  return RESERVED_SLUGS.includes(slug) || pages.some((page) => page.slug === slug);
}

export function pageProjectOptions(pages: StatusPage[]) {
  return PROJECT_OPTIONS.map((option) => ({
    ...option,
    disabled: pages.some((page) => page.project === option.value),
  }));
}

export function newGroupId() {
  return `grp_${crypto.randomUUID().slice(0, 8)}`;
}

function toComponent(monitor: Monitor): StatusComponentConfig {
  return { monitorId: monitor.id, displayName: monitor.name, showChart: false };
}

type NewPageValues = { project: string; title: string; slug: string };

export function blankStatusPage({ project, title, slug }: NewPageValues, monitors: Monitor[]): StatusPage {
  const projectMonitors = monitors.filter((monitor) => monitor.project === project);
  return {
    id: `sp_${crypto.randomUUID().slice(0, 8)}`,
    slug,
    project,
    title,
    description: `Live status for ${title}.`,
    logoUrl: null,
    theme: { primary: "#C2410C", background: "#FFFFFF", surface: "#F7F7F5", text: "#16171A", mode: "light" },
    groups: [{ id: newGroupId(), name: "Services", components: projectMonitors.map(toComponent) }],
    options: { showUptimeBars: true, showResponseTimes: false, historyDays: 90 },
    customDomain: null,
    published: false,
    updatedAt: Date.now(),
  };
}

export function isSamePage(a: StatusPage, b: StatusPage) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function mapGroup(page: StatusPage, groupId: string, change: (group: StatusGroupConfig) => StatusGroupConfig) {
  return { ...page, groups: page.groups.map((group) => (group.id === groupId ? change(group) : group)) };
}

export function addGroup(page: StatusPage): StatusPage {
  return { ...page, groups: [...page.groups, { id: newGroupId(), name: "New group", components: [] }] };
}

export function renameGroup(page: StatusPage, groupId: string, name: string) {
  return mapGroup(page, groupId, (group) => ({ ...group, name }));
}

export function removeGroup(page: StatusPage, groupId: string): StatusPage {
  return { ...page, groups: page.groups.filter((group) => group.id !== groupId) };
}

export function setGroupMonitors(page: StatusPage, groupId: string, monitorIds: string[], monitors: Monitor[]) {
  return mapGroup(page, groupId, (group) => {
    const kept = group.components.filter((item) => monitorIds.includes(item.monitorId));
    const added = monitors
      .filter((monitor) => monitorIds.includes(monitor.id) && !kept.some((item) => item.monitorId === monitor.id))
      .map(toComponent);
    return { ...group, components: [...kept, ...added] };
  });
}

export function updateComponent(
  page: StatusPage,
  groupId: string,
  monitorId: string,
  patch: Partial<StatusComponentConfig>,
) {
  return mapGroup(page, groupId, (group) => ({
    ...group,
    components: group.components.map((item) => (item.monitorId === monitorId ? { ...item, ...patch } : item)),
  }));
}

export function removeComponent(page: StatusPage, groupId: string, monitorId: string) {
  return mapGroup(page, groupId, (group) => ({
    ...group,
    components: group.components.filter((item) => item.monitorId !== monitorId),
  }));
}

export function componentPosition(page: StatusPage, groupId: string, monitorId: string) {
  const components = page.groups.find((group) => group.id === groupId)?.components ?? [];
  return { index: components.findIndex((item) => item.monitorId === monitorId), count: components.length };
}

export function moveComponentTo(page: StatusPage, groupId: string, monitorId: string, index: number) {
  return mapGroup(page, groupId, (group) => {
    const item = group.components.find((component) => component.monitorId === monitorId);
    if (!item) return group;
    const rest = group.components.filter((component) => component.monitorId !== monitorId);
    const target = Math.max(0, Math.min(rest.length, index));
    return { ...group, components: [...rest.slice(0, target), item, ...rest.slice(target)] };
  });
}

export function moveComponentBy(page: StatusPage, groupId: string, monitorId: string, offset: number) {
  const { index } = componentPosition(page, groupId, monitorId);
  return moveComponentTo(page, groupId, monitorId, index + offset);
}

export function moveComponentToGroup(page: StatusPage, monitorId: string, fromGroupId: string, toGroupId: string) {
  const item = page.groups
    .find((group) => group.id === fromGroupId)
    ?.components.find((component) => component.monitorId === monitorId);
  if (!item) return page;
  const removed = removeComponent(page, fromGroupId, monitorId);
  return mapGroup(removed, toGroupId, (group) => ({ ...group, components: [...group.components, item] }));
}

export function monitorsInOtherGroups(page: StatusPage, groupId: string) {
  return page.groups
    .filter((group) => group.id !== groupId)
    .flatMap((group) => group.components.map((item) => item.monitorId));
}

export function componentCount(page: StatusPage) {
  return page.groups.reduce((sum, group) => sum + group.components.length, 0);
}

export type ContrastCheck = {
  key: "text" | "primary";
  label: string;
  ratio: number;
  min: number;
  isFailing: boolean;
  suggestion: string;
};

export function contrastLevel(ratio: number): { label: string; tone: Tone } {
  if (ratio >= MIN_TEXT_CONTRAST) return { label: "AA", tone: "up" };
  if (ratio >= MIN_PRIMARY_CONTRAST) return { label: "AA Large", tone: "degraded" };
  return { label: "Fails", tone: "down" };
}

export function contrastChecks(theme: StatusTheme): ContrastCheck[] {
  const text = contrastRatio(theme.text, theme.background);
  const primary = contrastRatio(theme.primary, theme.background);
  return [
    {
      key: "text",
      label: "Text on background",
      ratio: text,
      min: MIN_TEXT_CONTRAST,
      isFailing: text < MIN_TEXT_CONTRAST,
      suggestion: suggestReadable(theme.text, theme.background, MIN_TEXT_CONTRAST),
    },
    {
      key: "primary",
      label: "Primary on background",
      ratio: primary,
      min: MIN_PRIMARY_CONTRAST,
      isFailing: primary < MIN_PRIMARY_CONTRAST,
      suggestion: suggestReadable(theme.primary, theme.background, MIN_PRIMARY_CONTRAST),
    },
  ];
}

export function formatRatio(ratio: number) {
  return `${ratio.toFixed(1)}:1`;
}

export function isValidHost(host: string) {
  return /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host);
}

export function cnameName(host: string) {
  return host.split(".")[0] || "status";
}

export function filterSubscribers(subscribers: StatusSubscriber[], query: string) {
  const needle = query.trim().toLowerCase();
  return needle ? subscribers.filter((subscriber) => subscriber.email.includes(needle)) : subscribers;
}

export function subscribersCsv(subscribers: StatusSubscriber[]) {
  const rows = subscribers.map((subscriber) =>
    csvRow([
      subscriber.email,
      subscriber.confirmed ? "confirmed" : "pending",
      new Date(subscriber.createdAt).toISOString(),
    ]),
  );
  return [csvRow(["email", "status", "subscribed_at"]), ...rows].join("\n");
}

export function initials(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function uptimesOn(snapshot: StatusSnapshot, index: number) {
  return snapshot.groups.flatMap((group) =>
    group.components.flatMap((item) => {
      const uptime = item.days[index]?.uptime;
      return uptime === null || uptime === undefined ? [] : [uptime];
    }),
  );
}

export function snapshotDays(snapshot: StatusSnapshot): SnapshotDay[] {
  const first = snapshot.groups.flatMap((group) => group.components)[0];
  if (!first) return [];
  return first.days.map((day, index) => {
    const uptimes = uptimesOn(snapshot, index);
    return { date: day.date, uptime: uptimes.length ? Math.min(...uptimes) : null, incidents: day.incidents };
  });
}

export function snapshotUptime(snapshot: StatusSnapshot) {
  const uptimes = snapshot.groups.flatMap((group) =>
    group.components.flatMap((item) => (item.uptime90d === null ? [] : [item.uptime90d])),
  );
  return uptimes.length ? uptimes.reduce((sum, value) => sum + value, 0) / uptimes.length : null;
}

export function hasFailingContrast(theme: StatusTheme) {
  return contrastChecks(theme).some((check) => check.isFailing);
}

export function modeHint(theme: StatusTheme) {
  if (theme.mode === "auto") return "Follows each visitor's system setting. Your colours apply in the matching mode.";
  const isDark = isDarkColor(theme.background);
  if (isDark === (theme.mode === "dark")) return null;
  return `Your background is ${isDark ? "dark" : "light"}, so ${theme.mode} mode uses the default ${theme.mode} colours.`;
}

export function groupOfComponent(page: StatusPage, monitorId: string) {
  return page.groups.find((group) => group.components.some((item) => item.monitorId === monitorId));
}

export function componentGripId(monitorId: string) {
  return `component-grip-${monitorId}`;
}
