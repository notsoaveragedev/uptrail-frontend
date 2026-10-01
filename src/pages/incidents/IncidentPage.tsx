import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useParams } from "react-router";
import { incidentQuery } from "@/api/incidents";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { AffectedMonitors } from "@/components/incidents/AffectedMonitors";
import { IncidentDetailSkeleton } from "@/components/incidents/IncidentDetailSkeleton";
import { IncidentHeader } from "@/components/incidents/IncidentHeader";
import { IncidentStepper } from "@/components/incidents/IncidentStepper";
import { IncidentTimeline } from "@/components/incidents/IncidentTimeline";
import { KeyTimes } from "@/components/incidents/KeyTimes";
import { RelatedAlerts } from "@/components/incidents/RelatedAlerts";
import { UpdateComposer } from "@/components/incidents/UpdateComposer";
import { POSTMORTEM_TEMPLATE } from "@/lib/incidents";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";
import type { Incident } from "@/types/incident";

export function IncidentPage() {
  const { orgSlug = "", incidentId = "" } = useParams();
  const { data: incident, isPending } = useQuery(incidentQuery(orgSlug, incidentId));

  if (isPending) return <IncidentDetailSkeleton />;
  if (!incident) return <InAppNotFoundPage />;

  return <IncidentDetail key={incident.id} incident={incident} />;
}

function IncidentDetail({ incident }: { incident: Incident }) {
  const composerRef = useRef<HTMLDivElement>(null);
  const [postmortemCount, setPostmortemCount] = useState(0);

  function writePostmortem() {
    setPostmortemCount((count) => count + 1);
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <>
      <title>{`${incident.id} ${incident.title} · Uptrail`}</title>
      <div className="flex flex-col gap-4 pb-12">
        <IncidentHeader incident={incident} onWritePostmortem={writePostmortem} />
        <IncidentStepper incident={incident} />
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <SectionErrorBoundary>
            <IncidentTimeline
              incident={incident}
              composer={
                <div ref={composerRef}>
                  <UpdateComposer
                    key={postmortemCount}
                    incident={incident}
                    initialMessage={postmortemCount ? POSTMORTEM_TEMPLATE : ""}
                  />
                </div>
              }
            />
          </SectionErrorBoundary>
          <aside aria-label="Incident details" className="flex flex-col gap-4 xl:sticky xl:top-0">
            <SectionErrorBoundary>
              <AffectedMonitors incident={incident} />
            </SectionErrorBoundary>
            <SectionErrorBoundary>
              <RelatedAlerts incident={incident} />
            </SectionErrorBoundary>
            <SectionErrorBoundary>
              <KeyTimes incident={incident} />
            </SectionErrorBoundary>
          </aside>
        </div>
      </div>
    </>
  );
}
