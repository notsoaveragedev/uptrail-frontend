import { Button } from "antd";
import { useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { MetaList } from "@/components/ui/MetaList";
import { PersonAvatar } from "@/components/ui/PersonAvatar";
import { useCurrentRole } from "@/hooks/usePermission";
import { useToast } from "@/hooks/useToast";
import { FORBIDDEN_TRAIL, forbiddenTimeline } from "@/lib/forbidden";
import { accessGranters, roleName } from "@/lib/members";
import { paths } from "@/lib/paths";
import { permissionLabel } from "@/lib/permissions";
import { shortName } from "@/lib/people";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";
import { CURRENT_MEMBER_ID, MEMBERS, ROLES } from "@/mocks/team";

type ForbiddenScreenProps = {
  permission?: string | null;
  isFullPage?: boolean;
};

const GRANTERS = accessGranters(MEMBERS, CURRENT_MEMBER_ID);

export function ForbiddenScreen({ permission = null, isFullPage = false }: ForbiddenScreenProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug } = useParams();
  const { role, granted } = useCurrentRole();
  const [isRequested, setIsRequested] = useState(false);
  const isBlockedByRole = permission !== null && !granted.has(permission);
  const action = isBlockedByRole ? permissionLabel(permission) : "open this page";
  const cause = isBlockedByRole
    ? `Your role (${role.name}) can't ${action}.`
    : "This page is off limits for your account.";
  const granterNames = GRANTERS.map((member) => shortName(member.name)).join(" and ");

  function requestAccess() {
    setIsRequested(true);
    toast.success("Access request sent", `${granterNames} will get an email. The waiting is the hard part.`);
  }

  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${isFullPage ? "min-h-dvh bg-canvas py-16" : "py-16"}`}
    >
      <div aria-hidden className="flex max-w-full justify-center overflow-hidden">
        <CheckTrail checks={FORBIDDEN_TRAIL} />
      </div>
      <MetaList aria-hidden className="mt-3 justify-center font-mono text-xs text-subtle">
        <span className="text-down">0.00% access</span>
        <span>3 of 3 regions agree</span>
        <span>nobody was paged</span>
      </MetaList>

      <div role="alert" className="mt-10 flex flex-col items-center">
        <span className="font-mono text-caps font-semibold tracking-widest text-subtle uppercase">
          403 · Access denied
        </span>
        <h1 className="display-stretch mt-3 max-w-xl text-display font-semibold tracking-tight sm:text-headline">
          This page is above your pay grade.
        </h1>
        <p className="mt-4 max-w-md text-body text-pretty text-muted">
          {isBlockedByRole
            ? `Well, above your role. You're signed in as ${role.name}, and this needs someone who can ${action}.`
            : "Someone decided this page isn't for you. It's not personal, it's RBAC."}
        </p>
      </div>

      <section
        aria-label="Incident #403"
        className="mt-10 w-full max-w-md rounded-lg border border-line bg-card p-5 text-left"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-md font-semibold">Incident #403: You vs. this page</h2>
          <span className="font-mono text-xs text-subtle">just now</span>
        </div>
        <ol className="mt-4 flex flex-col gap-3">
          {forbiddenTimeline(action, cause).map((step) => (
            <li key={step.status} className="flex flex-col items-start gap-1">
              <IncidentStatusPill status={step.status} />
              <span className="text-muted">{step.note}</span>
            </li>
          ))}
        </ol>
        {GRANTERS.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs text-subtle">People who can let you in. Asking nicely helps. Snacks help more.</p>
            <ul className="mt-3 flex flex-col gap-2">
              {GRANTERS.map((member) => (
                <li key={member.id} className="flex items-center gap-2.5">
                  <PersonAvatar name={member.name} hasTooltip={false} />
                  <span className="font-medium">{member.name}</span>
                  <span className="ml-auto text-xs text-subtle">{roleName(ROLES, member.roleId)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button type="primary" disabled={isRequested || GRANTERS.length === 0} onClick={requestAccess}>
          {isRequested ? "Request sent" : "Request access"}
        </Button>
        <Button icon={<LuArrowLeft />} onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button type="text" onClick={() => navigate(orgSlug ? paths.overview(orgSlug) : DEFAULT_APP_PATH)}>
          Go to overview
        </Button>
      </div>
    </div>
  );
}
