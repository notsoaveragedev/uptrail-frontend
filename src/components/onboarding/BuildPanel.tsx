import type { ReactNode } from "react";
import { LuFolder, LuGlobe, LuMail, LuSlack, LuActivity, LuBuilding2 } from "react-icons/lu";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { displayUrl, formatInterval } from "@/lib/monitors";
import { isActive, type OnboardingDraft } from "@/lib/onboarding";
import type { MonitorStatus } from "@/types/monitor";

type BuildPanelProps = {
  draft: OnboardingDraft;
  checks: MonitorStatus[];
  isStatusStep: boolean;
};

export function BuildPanel({ draft, checks, isStatusStep }: BuildPanelProps) {
  const { organization, project, monitor, alerts, statusPage } = draft;
  const hasMonitor = isActive(draft, "monitor");
  const hasAlerts = isActive(draft, "alerts");

  return (
    <aside
      aria-label="What you're building"
      className="flex flex-1 flex-col gap-5 border-l border-line bg-panel px-6 py-10"
    >
      <span className="text-caps font-semibold tracking-widest text-subtle uppercase">What you're building</span>
      <ol aria-live="polite" className="flex flex-col gap-2">
        <ManifestRow
          icon={<LuBuilding2 />}
          title={organization.name}
          ghost="Your organization"
          meta={organization.slug && `uptrail.app/o/${organization.slug}`}
        />
        <ManifestRow icon={<LuFolder />} title={project.name} ghost="Your first project" depth={1} />
        <ManifestRow
          icon={<LuActivity />}
          title={hasMonitor ? monitor.name : ""}
          ghost="Your first monitor"
          meta={
            hasMonitor && monitor.url && `${displayUrl(monitor.url)} · every ${formatInterval(monitor.intervalSec)}`
          }
          depth={2}
        >
          {hasMonitor && checks.length > 0 && (
            <div aria-hidden className="mt-2">
              <CheckTrail checks={checks} />
            </div>
          )}
        </ManifestRow>
        <ManifestRow icon={<LuMail />} title={hasAlerts ? alerts.email : ""} ghost="Alert email" depth={2} />
        {hasAlerts && alerts.slackUrl && <ManifestRow icon={<LuSlack />} title="Slack channel" ghost="" depth={2} />}
        {statusPage.isEnabled && (
          <ManifestRow
            icon={<LuGlobe />}
            title={statusPage.title}
            ghost="Public status page"
            meta={statusPage.slug && `uptrail.app/status/${statusPage.slug}`}
          />
        )}
      </ol>
      {isStatusStep && statusPage.isEnabled && <MiniStatusPage title={statusPage.title || "Your status page"} />}
    </aside>
  );
}

type ManifestRowProps = {
  icon: ReactNode;
  title: string;
  ghost: string;
  meta?: string | false;
  depth?: number;
  children?: ReactNode;
};

const DEPTH_PADDING = ["", "ml-5", "ml-10"];

function ManifestRow({ icon, title, ghost, meta, depth = 0, children }: ManifestRowProps) {
  const isGhost = !title;

  return (
    <li
      className={`flex gap-2.5 rounded-md px-3 py-2 ${DEPTH_PADDING[depth]} ${
        isGhost ? "border border-dashed border-line text-faint" : "border border-line bg-card text-ink"
      }`}
    >
      <span aria-hidden className={`mt-0.5 [&_svg]:size-4 ${isGhost ? "text-faint" : "text-muted"}`}>
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{title || ghost}</span>
        {meta && <span className="truncate font-mono text-xs text-subtle">{meta}</span>}
        {children}
      </span>
    </li>
  );
}

function MiniStatusPage({ title }: { title: string }) {
  return (
    <div data-theme="light" className="flex flex-col gap-3 rounded-lg border border-line bg-card p-4 text-ink">
      <span className="font-semibold">{title}</span>
      <span className="rounded-md bg-up-soft px-3 py-2 text-xs font-medium text-up">All systems operational</span>
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">Services</span>
        <div aria-hidden className="flex h-5 gap-px">
          {Array.from({ length: 45 }, (_, index) => (
            <span key={index} className={`flex-1 rounded-xs ${index === 44 ? "bg-up" : "bg-line-strong"}`} />
          ))}
        </div>
        <span className="text-xs text-subtle">No history yet · today is green</span>
      </div>
    </div>
  );
}
