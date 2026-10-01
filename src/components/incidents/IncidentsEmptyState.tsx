import { Button, Empty } from "antd";
import { LuCircleCheck } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { paths } from "@/lib/paths";

type IncidentsEmptyStateProps = {
  hasFilters: boolean;
  isOpenTab: boolean;
  quietDays: number | null;
  onClear: () => void;
};

export function IncidentsEmptyState({ hasFilters, isOpenTab, quietDays, onClear }: IncidentsEmptyStateProps) {
  const { orgSlug = "" } = useParams();

  if (hasFilters) {
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No incidents match these filters.">
        <Button onClick={onClear}>Clear filters</Button>
      </Empty>
    );
  }

  if (isOpenTab) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-muted">
        <LuCircleCheck aria-hidden className="size-5 text-up" />
        <p className="text-ink">
          All clear · no open incidents
          {quietDays !== null && quietDays > 0 && ` for ${quietDays} day${quietDays === 1 ? "" : "s"}`}
        </p>
        <Link to={paths.incidentsList(orgSlug, { tab: "resolved" })}>View resolved incidents</Link>
      </div>
    );
  }

  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No resolved incidents yet." />;
}
