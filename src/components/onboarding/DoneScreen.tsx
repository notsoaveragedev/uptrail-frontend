import { Button } from "antd";
import type { ReactNode } from "react";
import { LuActivity, LuBell, LuBuilding2, LuFolder, LuGlobe } from "react-icons/lu";
import { Link, useNavigate } from "react-router";
import { AuthNotice } from "@/components/auth/AuthNotice";
import { CopyField } from "@/components/ui/CopyField";
import { displayUrl, formatInterval } from "@/lib/monitors";
import { isIncluded, type OnboardingDraft } from "@/lib/onboarding";
import { paths } from "@/lib/paths";
import { STATUS_ORIGIN } from "@/lib/statusPages";

export function DoneScreen({ draft }: { draft: OnboardingDraft }) {
  const navigate = useNavigate();
  const orgSlug = draft.organization.slug;
  const hasMonitor = isIncluded(draft, "monitor");
  const hasAlerts = isIncluded(draft, "alerts");

  return (
    <AuthNotice
      tone="success"
      route="201 Created"
      title="You're on the trail."
      description={
        hasMonitor
          ? `We'll check ${displayUrl(draft.monitor.url)} every ${formatInterval(draft.monitor.intervalSec)} from 3 regions${hasAlerts ? ` and email ${draft.alerts.email} if it goes down` : ""}.`
          : `${draft.organization.name} is ready. Add your first monitor whenever you like.`
      }
    >
      <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
        <CreatedRow icon={<LuBuilding2 />} label={draft.organization.name} meta={`uptrail.app/o/${orgSlug}`} />
        <CreatedRow icon={<LuFolder />} label={draft.project.name} meta={`/projects/${draft.project.slug}`} />
        <CreatedRow
          icon={<LuActivity />}
          label={hasMonitor ? draft.monitor.name : "First monitor"}
          meta={hasMonitor ? displayUrl(draft.monitor.url) : null}
          addPath={hasMonitor ? null : paths.monitorNew(orgSlug)}
        />
        <CreatedRow
          icon={<LuBell />}
          label={hasAlerts ? "Email alerts" : "Alert channel"}
          meta={hasAlerts ? draft.alerts.email : null}
          addPath={hasAlerts ? null : paths.alertChannels(orgSlug)}
        />
        <CreatedRow
          icon={<LuGlobe />}
          label={draft.statusPage.isEnabled ? draft.statusPage.title : "Status page"}
          meta={draft.statusPage.isEnabled ? `status/${draft.statusPage.slug} · draft` : null}
          addPath={draft.statusPage.isEnabled ? null : paths.statusPages(orgSlug)}
        />
      </ul>
      {draft.statusPage.isEnabled && (
        <CopyField value={`${STATUS_ORIGIN}/status/${draft.statusPage.slug}`} label="Status page URL" />
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="primary" size="large" autoFocus onClick={() => navigate(paths.overview(orgSlug))}>
          Open {draft.organization.name}
        </Button>
        <Button size="large" onClick={() => navigate(paths.settings(orgSlug, "members"))}>
          Invite your team
        </Button>
      </div>
    </AuthNotice>
  );
}

type CreatedRowProps = { icon: ReactNode; label: string; meta: string | null; addPath?: string | null };

function CreatedRow({ icon, label, meta, addPath = null }: CreatedRowProps) {
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <span aria-hidden className={`[&_svg]:size-4 ${addPath ? "text-faint" : "text-up"}`}>
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={addPath ? "text-muted" : "text-ink"}>{label}</span>
        {meta && <span className="truncate font-mono text-xs text-subtle">{meta}</span>}
      </span>
      {addPath && (
        <Link to={addPath} className="text-xs">
          Add later
        </Link>
      )}
    </li>
  );
}
