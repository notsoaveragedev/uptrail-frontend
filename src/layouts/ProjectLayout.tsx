import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Button, Tabs, Tag } from "antd";
import { LuPlus } from "react-icons/lu";
import { Link, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { membersQuery } from "@/api/members";
import { monitorsQuery } from "@/api/monitors";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { ProjectMark } from "@/components/projects/ProjectMark";
import { ProjectStatus } from "@/components/projects/ProjectStatus";
import { Can } from "@/components/rbac/Can";
import { TabLabel } from "@/components/ui/TabLabel";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useProject } from "@/hooks/useProject";
import { paths } from "@/lib/paths";
import { PROJECT_TABS, projectHealth } from "@/lib/projects";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";
import { plural } from "@/lib/format";

export function ProjectLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { orgSlug = "", projectSlug = "" } = useParams();
  const { project, isPending } = useProject();
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { data: incidents = [] } = useQuery(incidentsQuery(orgSlug));
  const { data: members = [] } = useQuery(membersQuery(orgSlug));

  if (!isPending && !project) return <InAppNotFoundPage />;

  const health = projectHealth(projectSlug, monitors, incidents);
  const base = paths.project(orgSlug, projectSlug);
  const activeTab = PROJECT_TABS.find((tab) => pathname.startsWith(`${base}/${tab.key}`))?.key ?? "overview";
  const counts: Record<string, number> = {
    monitors: health.total,
    incidents: incidents.filter((incident) => incident.project === projectSlug).length,
    access: members.length,
  };

  return (
    <div className="flex flex-col gap-4">
      <title>{`${project?.name ?? "Project"} · Uptrail`}</title>
      <Breadcrumb
        className="-mb-2 text-xs"
        items={[{ title: <Link to={paths.projects(orgSlug)}>Projects</Link> }, { title: project?.name ?? "…" }]}
      />
      {project ? (
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              <ProjectMark name={project.name} />
              {project.name}
            </span>
          }
          meta={
            <MetaList>
              <ProjectStatus health={health} />
              <span>{plural(health.total, "monitor")}</span>
              <span>
                <UptimeValue value={health.uptime30d} /> 30d
              </span>
              <span className={health.openIncidents ? "text-down" : ""}>
                {plural(health.openIncidents, "open incident")}
              </span>
              {project.tags.length > 0 && (
                <span className="flex gap-1">
                  {project.tags.map((tag) => (
                    <Tag key={tag} className="m-0">
                      {tag}
                    </Tag>
                  ))}
                </span>
              )}
            </MetaList>
          }
          actions={
            <Can permission="monitor:create">
              <Button type="primary" icon={<LuPlus />} onClick={() => navigate(paths.monitorNew(orgSlug))}>
                New monitor
              </Button>
            </Can>
          }
        />
      ) : (
        <SkeletonBlock isInset className="h-14 w-96" />
      )}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => navigate(paths.project(orgSlug, projectSlug, key))}
        items={PROJECT_TABS.map((tab) => ({
          key: tab.key,
          label: <TabLabel label={tab.label} count={counts[tab.key]} isMuted={tab.key !== activeTab} />,
        }))}
        className="-mb-4"
      />
      {project && <Outlet />}
    </div>
  );
}
