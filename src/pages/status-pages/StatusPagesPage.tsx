import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useMemo, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { monitorsQuery } from "@/api/monitors";
import { statusPagesQuery } from "@/api/statusPages";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { NewStatusPageModal } from "@/components/status-pages/NewStatusPageModal";
import { StatusPageCard } from "@/components/status-pages/StatusPageCard";
import { StatusPagesEmpty } from "@/components/status-pages/StatusPagesEmpty";
import { StatusPagesSummary } from "@/components/status-pages/StatusPagesSummary";
import { useDeleteStatusPageFlow } from "@/components/status-pages/useDeleteStatusPageFlow";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useNow } from "@/hooks/useNow";
import { buildStatusSnapshot } from "@/mocks/statusSnapshot";
import type { StatusPage, StatusSnapshot } from "@/types/statusPage";

export function StatusPagesPage() {
  const { orgSlug = "" } = useParams();
  const { data: pages } = useQuery(statusPagesQuery(orgSlug));
  const { data: monitors } = useQuery(monitorsQuery(orgSlug));
  const { data: incidents } = useQuery(incidentsQuery(orgSlug));
  const [isCreating, setIsCreating] = useState(false);
  const snapshots = useMemo(
    () => pages && monitors && incidents && pages.map((page) => buildStatusSnapshot(page, monitors, incidents)),
    [pages, monitors, incidents],
  );

  return (
    <>
      <title>Status pages · Uptrail</title>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Status pages"
          meta={pages && snapshots && pages.length > 0 && <StatusPagesSummary pages={pages} snapshots={snapshots} />}
          actions={
            <Button type="primary" icon={<LuPlus />} onClick={() => setIsCreating(true)}>
              New status page
            </Button>
          }
        />
        <SectionErrorBoundary>
          {!snapshots && <CardGridSkeleton />}
          {pages?.length === 0 && <StatusPagesEmpty onCreate={() => setIsCreating(true)} />}
          {pages && snapshots && pages.length > 0 && <StatusPageGrid pages={pages} snapshots={snapshots} />}
        </SectionErrorBoundary>
      </div>
      <NewStatusPageModal open={isCreating} onClose={() => setIsCreating(false)} />
    </>
  );
}

type StatusPageGridProps = {
  pages: StatusPage[];
  snapshots: StatusSnapshot[];
};

function StatusPageGrid({ pages, snapshots }: StatusPageGridProps) {
  const now = useNow(30_000);
  const deletePage = useDeleteStatusPageFlow();

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {pages.map((page, index) => (
        <StatusPageCard key={page.id} page={page} snapshot={snapshots[index]} now={now} onDelete={deletePage} />
      ))}
    </ul>
  );
}

function CardGridSkeleton() {
  return (
    <div aria-busy className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <SkeletonBlock key={index} className="h-56 border border-line" />
      ))}
    </div>
  );
}
