import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import type { CheckResult } from "@/types/monitorDetail";
import { ChecksTable } from "./ChecksTable";

export function ChecksTab({ monitorId, checks }: { monitorId: string; checks: CheckResult[] }) {
  const { orgSlug } = useParams();
  const failures = checks.filter((check) => check.status !== "up").length;

  return (
    <Card
      title={
        <>
          Check results
          <span className="font-mono text-xs font-normal text-subtle">
            {checks.length} checks · {failures} failed
          </span>
        </>
      }
      extra={<Link to={`/o/${orgSlug}/logs?monitor=${monitorId}`}>Open in log explorer</Link>}
      className="overflow-hidden"
    >
      <ChecksTable
        checks={checks}
        pagination={{ pageSize: 12, size: "small", showSizeChanger: false, className: "px-4" }}
      />
    </Card>
  );
}
