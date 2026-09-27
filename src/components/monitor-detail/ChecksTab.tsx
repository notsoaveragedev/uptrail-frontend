import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { paths } from "@/lib/paths";
import type { RecentCheck } from "@/types/monitorDetail";
import { ChecksTable } from "./ChecksTable";

export function ChecksTab({ monitorId, checks }: { monitorId: string; checks: RecentCheck[] }) {
  const { orgSlug = "" } = useParams();
  const failures = checks.filter((check) => check.status !== "up").length;

  return (
    <Card
      title="Check results"
      meta={`${checks.length} checks · ${failures} failed`}
      extra={<Link to={paths.logs(orgSlug, { monitor: monitorId })}>Open in log explorer</Link>}
      className="overflow-hidden"
    >
      <ChecksTable
        checks={checks}
        pagination={{ pageSize: 12, size: "small", showSizeChanger: false, className: "px-4" }}
      />
    </Card>
  );
}
