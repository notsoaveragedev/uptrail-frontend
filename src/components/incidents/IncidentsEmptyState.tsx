import { LuCircleCheck, LuSiren } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { paths } from "@/lib/paths";
import { plural } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

type IncidentsEmptyStateProps = {
  hasFilters: boolean;
  isOpenTab: boolean;
  quietDays: number | null;
  onClear: () => void;
};

export function IncidentsEmptyState({ hasFilters, isOpenTab, quietDays, onClear }: IncidentsEmptyStateProps) {
  const { orgSlug = "" } = useParams();

  if (hasFilters) {
    return <EmptyState icon={<LuSiren />} title="No incidents match these filters" onClear={onClear} />;
  }

  if (isOpenTab) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-muted">
        <LuCircleCheck aria-hidden className="size-5 text-up" />
        <p className="text-ink">
          All clear · no open incidents
          {quietDays !== null && quietDays > 0 && ` for ${plural(quietDays, "day")}`}
        </p>
        <Link to={paths.incidentsList(orgSlug, { tab: "resolved" })}>View resolved incidents</Link>
      </div>
    );
  }

  return <EmptyState icon={<LuSiren />} title="No resolved incidents yet" />;
}
