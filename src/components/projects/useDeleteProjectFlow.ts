import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { useDeleteProjects } from "@/api/projects";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";
import type { Project } from "@/types/project";
import { plural } from "@/lib/format";

export function useDeleteProjectFlow() {
  const { orgSlug = "" } = useParams();
  const toast = useToast();
  const confirm = useConfirm();
  const remove = useDeleteProjects(orgSlug);
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));

  return async (project: Project) => {
    const monitorCount = monitors.filter((monitor) => monitor.project === project.slug).length;
    const isConfirmed = await confirm({
      title: `Delete ${project.name}?`,
      description: "This deletes the project and everything in it. It can't be undone.",
      isDanger: true,
      typeToConfirm: {
        expected: project.slug,
        consequences: [
          `${plural(monitorCount, "monitor")} and their check history`,
          "Its dashboards, alert rules and status page",
          "Project overrides on members",
        ],
      },
      confirmLabel: "Delete project",
    });
    if (!isConfirmed) return false;
    remove.mutate([project.id]);
    toast.success(`${project.name} deleted`);
    return true;
  };
}
