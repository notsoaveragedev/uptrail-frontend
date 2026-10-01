import { Button } from "antd";
import type { ReactNode } from "react";
import { LuPlus } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ASSIGNEE_ME, formatSpanShort, isIncidentOpen } from "@/lib/incidents";
import { paths } from "@/lib/paths";
import { currentUser } from "@/mocks/workspace";
import type { Incident } from "@/types/incident";

type IncidentsHeaderProps = {
  incidents: Incident[];
  mttaMs: number;
  mttrMs: number;
  onDeclare: () => void;
};

export function IncidentsHeader({ incidents, mttaMs, mttrMs, onDeclare }: IncidentsHeaderProps) {
  const { orgSlug = "" } = useParams();
  const open = incidents.filter(isIncidentOpen);
  const critical = open.filter((incident) => incident.severity === "critical").length;
  const mine = open.filter((incident) => incident.assignee === currentUser.name).length;

  return (
    <PageHeader
      title="Incidents"
      meta={
        <MetaList>
          <SentenceLink
            to={paths.incidentsList(orgSlug)}
            count={open.length}
            tone={open.length ? "text-down" : "text-ink"}
          >
            open
          </SentenceLink>
          {critical > 0 && (
            <SentenceLink to={paths.incidentsList(orgSlug, { severity: "critical" })} count={critical} tone="text-down">
              critical
            </SentenceLink>
          )}
          {mine > 0 && (
            <SentenceLink to={paths.incidentsList(orgSlug, { assignee: ASSIGNEE_ME })} count={mine} tone="text-ink">
              assigned to you
            </SentenceLink>
          )}
          <span>
            MTTA <span className="font-mono text-ink">{mttaMs ? formatSpanShort(mttaMs) : "—"}</span>
          </span>
          <span>
            MTTR <span className="font-mono text-ink">{mttrMs ? formatSpanShort(mttrMs) : "—"}</span>{" "}
            <span className="text-subtle">(30d)</span>
          </span>
        </MetaList>
      }
      actions={
        <Button type="primary" icon={<LuPlus />} onClick={onDeclare}>
          Declare incident
        </Button>
      }
    />
  );
}

type SentenceLinkProps = { to: string; count: number; tone: string; children: ReactNode };

function SentenceLink({ to, count, tone, children }: SentenceLinkProps) {
  return (
    <Link to={to} className="text-muted hover:text-ink">
      <span className={`font-mono ${tone}`}>{count}</span> {children}
    </Link>
  );
}
