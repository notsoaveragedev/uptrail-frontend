import { useParams } from "react-router";
import { subscribeToStatus } from "@/api/publicStatus";
import { StaleNotice } from "@/components/public-status/StaleNotice";
import { StatusPageNotFound } from "@/components/public-status/StatusPageNotFound";
import { StatusPageSkeleton } from "@/components/public-status/StatusPageSkeleton";
import { StatusPageView } from "@/components/public-status/StatusPageView";
import { useStatusSnapshot } from "@/components/public-status/useStatusSnapshot";
import { isNotFoundError } from "@/lib/publicStatus";

export function PublicStatusPage() {
  const { slug = "" } = useParams();
  const { data, error, isError, dataUpdatedAt } = useStatusSnapshot(slug);

  if (isNotFoundError(error)) return <StatusPageNotFound />;
  if (!data && isError) {
    return (
      <StatusPageNotFound
        eyebrow="Unavailable"
        title="Status is temporarily unavailable"
        description="We couldn't reach the status server. Refresh the page in a minute."
      />
    );
  }
  if (!data) return <StatusPageSkeleton />;

  return (
    <>
      <title>{`${data.snapshot.title} status`}</title>
      <StatusPageView
        snapshot={data.snapshot}
        lastCheckedAt={data.checkedAt}
        notice={isError && <StaleNotice since={dataUpdatedAt} />}
        onSubscribe={(email) => subscribeToStatus(slug, email)}
      />
    </>
  );
}
