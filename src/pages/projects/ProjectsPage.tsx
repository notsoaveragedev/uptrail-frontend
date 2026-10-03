import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { useMemo, useState } from "react";
import { LuArrowDownUp, LuFolderPlus, LuPlus } from "react-icons/lu";
import { useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { monitorsQuery } from "@/api/monitors";
import { projectsQuery } from "@/api/projects";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { FacetFilter } from "@/components/monitors-list/FacetFilter";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { useDeleteProjectFlow } from "@/components/projects/useDeleteProjectFlow";
import { Can } from "@/components/rbac/Can";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { useFilterParams } from "@/hooks/useFilterParams";
import { toggleItem, countBy } from "@/lib/list";
import {
  filterProjects,
  PROJECT_FILTER_KEYS,
  PROJECT_SORT_LABELS,
  PROJECT_SORTS,
  projectHealth,
  type ProjectHealth,
  projectTags,
  readProjectFilters,
} from "@/lib/projects";
import type { Project } from "@/types/project";
import { ResetFiltersButton } from "@/components/ui/ResetFiltersButton";
import { ToolbarSearch } from "@/components/ui/ToolbarSearch";

export function ProjectsPage() {
  const { orgSlug = "" } = useParams();
  const { data: projects } = useQuery(projectsQuery(orgSlug));
  const { data: monitors } = useQuery(monitorsQuery(orgSlug));
  const { data: incidents } = useQuery(incidentsQuery(orgSlug));
  const [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const health = useMemo(
    () =>
      projects &&
      monitors &&
      incidents &&
      new Map(projects.map((project) => [project.slug, projectHealth(project.slug, monitors, incidents)])),
    [projects, monitors, incidents],
  );
  const isReady = projects && health;

  return (
    <>
      <title>Projects · Uptrail</title>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Projects"
          meta={isReady && <ProjectsSummary projects={projects} health={health} />}
          actions={
            <Can permission="project:create">
              <Button type="primary" icon={<LuPlus />} onClick={() => setEditing(null)}>
                New project
              </Button>
            </Can>
          }
        />
        <SectionErrorBoundary>
          {isReady ? (
            <ProjectsView projects={projects} health={health} onCreate={() => setEditing(null)} onEdit={setEditing} />
          ) : (
            <div aria-busy className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <SkeletonBlock key={index} className="h-60 border border-line" />
              ))}
            </div>
          )}
        </SectionErrorBoundary>
      </div>
      {projects && (
        <ProjectModal
          project={editing}
          projects={projects}
          tagOptions={projectTags(projects)}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}

type HealthMap = Map<string, ProjectHealth>;

function ProjectsSummary({ projects, health }: { projects: Project[]; health: HealthMap }) {
  const all = [...health.values()];
  const down = all.reduce((sum, item) => sum + item.counts.down, 0);
  const open = all.reduce((sum, item) => sum + item.openIncidents, 0);

  return (
    <MetaList>
      <span>
        <span className="font-mono text-ink">{projects.length}</span> projects
      </span>
      <span>
        <span className="font-mono text-ink">{all.reduce((sum, item) => sum + item.total, 0)}</span> monitors
      </span>
      <span>
        <span className={`font-mono ${down ? "text-down" : "text-ink"}`}>{down}</span> down
      </span>
      <span>
        <span className={`font-mono ${open ? "text-down" : "text-ink"}`}>{open}</span> open incidents
      </span>
    </MetaList>
  );
}

type ProjectsViewProps = {
  projects: Project[];
  health: HealthMap;
  onCreate: () => void;
  onEdit: (project: Project) => void;
};

function ProjectsView({ projects, health, onCreate, onEdit }: ProjectsViewProps) {
  const { filters, hasFilters, setParam, clear } = useFilterParams(PROJECT_FILTER_KEYS, readProjectFilters);
  const deleteProject = useDeleteProjectFlow();
  const visible = filterProjects(projects, filters, health);
  const tagCounts = countBy(projects, (project) => project.tags);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FacetFilter
          label="Tags"
          selected={filters.tags}
          onChange={(values) => setParam("tag", values)}
          options={projectTags(projects).map((tag) => ({ value: tag, label: tag, count: tagCounts[tag] }))}
        />
        <ResetFiltersButton isVisible={hasFilters} onClick={clear} />
        <div className="ml-auto flex items-center gap-2">
          <CustomSelect
            size="middle"
            className="w-36"
            aria-label="Sort projects"
            value={filters.sort}
            onChange={(sort) => setParam("sort", sort, "health")}
            prefix={<LuArrowDownUp className="size-3.5 text-subtle" />}
            popupMatchSelectWidth={false}
            options={PROJECT_SORTS.map((sort) => ({ value: sort, label: PROJECT_SORT_LABELS[sort] }))}
          />
          <ToolbarSearch
            label="Search projects"
            placeholder="Search projects"
            value={filters.query}
            onChange={(value) => setParam("q", value)}
            className=""
          />
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-line bg-card">
          {hasFilters ? (
            <EmptyState icon={<LuFolderPlus />} title="No projects match these filters" onClear={clear} />
          ) : (
            <EmptyState
              icon={<LuFolderPlus />}
              title="Group monitors by client or product"
              description="Projects keep monitors, dashboards, alerts and a status page together."
              action={
                <Can permission="project:create">
                  <Button onClick={onCreate}>New project</Button>
                </Can>
              }
            />
          )}
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              health={health.get(project.slug) ?? projectHealth(project.slug, [], [])}
              onTag={(tag) => setParam("tag", toggleItem(filters.tags, tag))}
              onEdit={onEdit}
              onDelete={deleteProject}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
