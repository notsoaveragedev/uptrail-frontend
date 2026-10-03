import { Button, Dropdown, Tag } from "antd";
import { LuArrowRight, LuEllipsis, LuPencil, LuTrash2 } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import { UptimeValue } from "@/components/monitors/UptimeValue";
import { Card } from "@/components/ui/Card";
import { MetaList } from "@/components/ui/MetaList";
import { usePermission } from "@/hooks/usePermission";
import { paths } from "@/lib/paths";
import type { ProjectHealth } from "@/lib/projects";
import type { Project } from "@/types/project";
import { HealthBar } from "./HealthBar";
import { ProjectMark } from "./ProjectMark";
import { ProjectStatus } from "./ProjectStatus";
import { plural } from "@/lib/format";

type ProjectCardProps = {
  project: Project;
  health: ProjectHealth;
  onTag: (tag: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
};

export function ProjectCard({ project, health, onTag, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const canUpdate = usePermission("project:update");
  const canDelete = usePermission("project:delete");
  const path = paths.project(orgSlug, project.slug);

  return (
    <li className="group">
      <Card isInteractive className={`h-full ${health.worst === "down" ? "border-l-2 border-l-down" : ""}`}>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-start gap-3">
            <ProjectMark name={project.name} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Link to={path} className="truncate text-md font-semibold text-ink hover:text-ink hover:underline">
                {project.name}
              </Link>
              <span className="truncate font-mono text-xs text-subtle">{project.slug}</span>
            </div>
            <ProjectStatus health={health} />
          </div>
          <p className="line-clamp-2 text-muted">{project.description || "No description."}</p>
          <HealthBar counts={health.counts} total={health.total} />
          <div className="mt-auto flex flex-wrap items-center gap-1">
            {project.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-label={`Filter by ${tag}`}
                onClick={() => onTag(tag)}
                className="cursor-pointer"
              >
                <Tag className="m-0 hover:border-line-strong">{tag}</Tag>
              </button>
            ))}
          </div>
        </div>
        <footer className="flex items-center justify-between gap-3 border-t border-line py-2 pr-2 pl-4">
          <MetaList className="text-xs text-muted">
            <span>
              <UptimeValue value={health.uptime30d} className="text-xs" /> 30d
            </span>
            <Link
              to={paths.incidentsList(orgSlug, { project: project.slug })}
              className={health.openIncidents ? "text-down hover:text-down" : "text-muted hover:text-ink"}
            >
              {plural(health.openIncidents, "open incident")}
            </Link>
          </MetaList>
          <div className="row-actions flex items-center gap-1">
            <Button size="small" type="text" icon={<LuArrowRight />} iconPlacement="end" onClick={() => navigate(path)}>
              Open
            </Button>
            {(canUpdate.allowed || canDelete.allowed) && (
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{
                  items: [
                    ...(canUpdate.allowed
                      ? [{ key: "edit", icon: <LuPencil />, label: "Edit details", onClick: () => onEdit(project) }]
                      : []),
                    ...(canDelete.allowed
                      ? [
                          { type: "divider" as const },
                          {
                            key: "delete",
                            icon: <LuTrash2 />,
                            danger: true,
                            label: "Delete",
                            onClick: () => onDelete(project),
                          },
                        ]
                      : []),
                  ],
                }}
              >
                <Button
                  size="small"
                  type="text"
                  aria-label={`More actions for ${project.name}`}
                  icon={<LuEllipsis />}
                />
              </Dropdown>
            )}
          </div>
        </footer>
      </Card>
    </li>
  );
}
