import { isHttpUrl } from "./monitorForm";

export const ONBOARDING_STEPS = [
  { key: "organization", label: "Organization", description: "Where your team and monitors live" },
  { key: "project", label: "Project", description: "Group monitors by product or client" },
  { key: "monitor", label: "First monitor", description: "A URL we check around the clock" },
  { key: "alerts", label: "Alerts", description: "Who hears about it when it breaks" },
  { key: "status-page", label: "Status page", description: "Optional public page for your users" },
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEPS)[number]["key"];

export const INTERVAL_PRESETS = [
  { value: 30, label: "30 s" },
  { value: 60, label: "1 min" },
  { value: 300, label: "5 min" },
];

export type OnboardingDraft = {
  step: number;
  furthest: number;
  skipped: OnboardingStepKey[];
  organization: { name: string; slug: string };
  project: { name: string; slug: string };
  monitor: { url: string; name: string; intervalSec: number };
  alerts: { email: string; slackUrl: string };
  statusPage: { isEnabled: boolean; isCustomized: boolean; title: string; slug: string };
};

export function emptyDraft(email: string): OnboardingDraft {
  return {
    step: 0,
    furthest: 0,
    skipped: [],
    organization: { name: "", slug: "" },
    project: { name: "Production", slug: "production" },
    monitor: { url: "", name: "", intervalSec: 60 },
    alerts: { email, slackUrl: "" },
    statusPage: { isEnabled: false, isCustomized: false, title: "", slug: "" },
  };
}

export function monitorNameFromUrl(url: string) {
  if (!isHttpUrl(url)) return "";
  const host = new URL(url.trim()).hostname.replace(/^www\./, "");
  const [first, ...rest] = host.split(".");
  const label = rest.length > 1 && ["api", "app", "status"].includes(first) ? `${rest[0]} ${first}` : first;
  return label
    .split(/[-\s]/)
    .filter(Boolean)
    .map((word) => (word.length <= 3 && word === first ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}

export function advance(draft: OnboardingDraft, step: number): OnboardingDraft {
  return { ...draft, step, furthest: Math.max(draft.furthest, step) };
}

export function skip(draft: OnboardingDraft, key: OnboardingStepKey): OnboardingDraft {
  const next = advance(draft, draft.step + 1);
  return { ...next, skipped: [...new Set([...draft.skipped, key])] };
}

export function complete(draft: OnboardingDraft, key: OnboardingStepKey): OnboardingDraft {
  const next = advance(draft, draft.step + 1);
  return { ...next, skipped: next.skipped.filter((item) => item !== key) };
}

export function isIncluded(draft: OnboardingDraft, key: OnboardingStepKey) {
  return !draft.skipped.includes(key);
}

export function isActive(draft: OnboardingDraft, key: OnboardingStepKey) {
  return isIncluded(draft, key) && ONBOARDING_STEPS.findIndex((step) => step.key === key) <= draft.furthest;
}

export function withStatusPageDefaults(draft: OnboardingDraft): OnboardingDraft {
  if (draft.statusPage.isCustomized) return draft;
  return {
    ...draft,
    statusPage: { ...draft.statusPage, title: `${draft.organization.name} status`, slug: draft.organization.slug },
  };
}
