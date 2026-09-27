import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useState } from "react";
import { LuPlus, LuUpload } from "react-icons/lu";
import { useParams } from "react-router";
import { dashboardsQuery } from "@/api/dashboards";
import { DashboardCard } from "@/components/dashboards/DashboardCard";
import { DashboardsEmpty } from "@/components/dashboards/DashboardsEmpty";
import { ImportDashboardModal } from "@/components/dashboards/ImportDashboardModal";
import { NewDashboardModal } from "@/components/dashboards/NewDashboardModal";
import { useDashboardActions } from "@/components/dashboards/useDashboardActions";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useNow } from "@/hooks/useNow";
import { BLANK_TEMPLATE_ID, editedAgo, listSummary } from "@/lib/dashboards";
import type { Dashboard } from "@/types/dashboard";

type OpenModal = { kind: "new"; template: string } | { kind: "import" } | null;

export function DashboardsPage() {
  const { orgSlug = "" } = useParams();
  const { data: dashboards } = useQuery(dashboardsQuery(orgSlug));
  const [modal, setModal] = useState<OpenModal>(null);

  function openNew(template = BLANK_TEMPLATE_ID) {
    setModal({ kind: "new", template });
  }

  return (
    <>
      <title>Dashboards · Uptrail</title>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Dashboards"
          meta={dashboards && dashboards.length > 0 && <DashboardsSummary dashboards={dashboards} />}
          actions={
            <>
              <Button icon={<LuUpload />} onClick={() => setModal({ kind: "import" })}>
                Import JSON
              </Button>
              <Button type="primary" icon={<LuPlus />} onClick={() => openNew()}>
                New dashboard
              </Button>
            </>
          }
        />
        <SectionErrorBoundary>
          {!dashboards && <CardGridSkeleton />}
          {dashboards?.length === 0 && <DashboardsEmpty onPick={openNew} />}
          {dashboards && dashboards.length > 0 && <DashboardGrid dashboards={dashboards} />}
        </SectionErrorBoundary>
      </div>
      <NewDashboardModal
        open={modal?.kind === "new"}
        initialTemplate={modal?.kind === "new" ? modal.template : BLANK_TEMPLATE_ID}
        onClose={() => setModal(null)}
      />
      <ImportDashboardModal open={modal?.kind === "import"} onClose={() => setModal(null)} />
    </>
  );
}

function DashboardsSummary({ dashboards }: { dashboards: Dashboard[] }) {
  const now = useNow(30_000);
  const { count, projects, lastEdited } = listSummary(dashboards);

  return (
    <MetaList>
      <span>
        <span className="font-mono text-ink">{count}</span> dashboards
      </span>
      <span>
        <span className="font-mono text-ink">{projects}</span> {projects === 1 ? "project" : "projects"}
      </span>
      <span>
        last edited <span className="font-mono text-ink">{editedAgo(lastEdited, now)}</span>
      </span>
    </MetaList>
  );
}

function DashboardGrid({ dashboards }: { dashboards: Dashboard[] }) {
  const now = useNow(30_000);
  const actions = useDashboardActions();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {dashboards.map((dashboard) => (
        <DashboardCard key={dashboard.id} dashboard={dashboard} now={now} actions={actions} />
      ))}
    </ul>
  );
}

function CardGridSkeleton() {
  return (
    <div aria-busy className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <SkeletonBlock key={index} className="h-58 border border-line" />
      ))}
    </div>
  );
}
