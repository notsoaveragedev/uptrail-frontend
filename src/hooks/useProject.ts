import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { projectsQuery } from "@/api/projects";

export function useProject() {
  const { orgSlug = "", projectSlug = "" } = useParams();
  const { data: projects, isPending } = useQuery(projectsQuery(orgSlug));
  return { project: projects?.find((item) => item.slug === projectSlug), isPending };
}

export function useProjectOptions(scopeOrgSlug?: string) {
  const { orgSlug: routeOrgSlug = "" } = useParams();
  const orgSlug = scopeOrgSlug ?? routeOrgSlug;
  const { data: projects = [] } = useQuery(projectsQuery(orgSlug));
  return projects.map((project) => ({ value: project.slug, label: project.name }));
}
