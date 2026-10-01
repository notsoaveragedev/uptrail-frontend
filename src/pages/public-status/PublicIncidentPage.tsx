import { useParams } from "react-router";
import { subscribeToStatus } from "@/api/publicStatus";
import { PublicIncidentView } from "@/components/public-status/PublicIncidentView";
import { StatusPageNotFound } from "@/components/public-status/StatusPageNotFound";
import { StatusLink } from "@/components/public-status/StatusLink";
import { StatusPageSkeleton } from "@/components/public-status/StatusPageSkeleton";
import { useStatusSnapshot } from "@/components/public-status/useStatusSnapshot";
import { paths } from "@/lib/paths";
import { findIncident, isNotFoundError } from "@/lib/publicStatus";

export function PublicIncidentPage() {
  const { slug = "", incidentId = "" } = useParams();
  const { data, error } = useStatusSnapshot(slug);

  if (isNotFoundError(error)) return <StatusPageNotFound />;
  if (!data) return <StatusPageSkeleton />;

  const incident = findIncident(data.snapshot, incidentId);
  if (!incident) {
    return (
      <StatusPageNotFound
        title="Incident not found"
        description={`This incident isn't on the ${data.snapshot.title} status page anymore, or the link is wrong.`}
        action={<StatusLink to={paths.publicStatus(slug)}>Back to {data.snapshot.title} status</StatusLink>}
      />
    );
  }

  return (
    <>
      <title>{`${incident.title} · ${data.snapshot.title} status`}</title>
      <PublicIncidentView
        snapshot={data.snapshot}
        incident={incident}
        onSubscribe={(email) => subscribeToStatus(slug, email)}
      />
    </>
  );
}
