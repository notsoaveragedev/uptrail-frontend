import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import { useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { EditMonitorForm } from "@/components/monitor-form/EditMonitorForm";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";

export function EditMonitorPage() {
  const { orgSlug = "", monitorId = "" } = useParams();
  const { data: monitors } = useQuery(monitorsQuery(orgSlug));

  if (!monitors) return <EditMonitorSkeleton />;

  const monitor = monitors.find((item) => item.id === monitorId);
  if (!monitor) return <InAppNotFoundPage />;

  return (
    <>
      <title>{`Edit ${monitor.name} · Uptrail`}</title>
      <EditMonitorForm key={monitor.id} orgSlug={orgSlug} monitor={monitor} />
    </>
  );
}

function EditMonitorSkeleton() {
  return (
    <>
      <title>Edit monitor · Uptrail</title>
      <div className="flex flex-col gap-6" aria-busy>
        <Skeleton active title={{ width: "16rem" }} paragraph={{ rows: 1, width: "22rem" }} />
        <div className="rounded-lg border border-line bg-card p-5">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    </>
  );
}
