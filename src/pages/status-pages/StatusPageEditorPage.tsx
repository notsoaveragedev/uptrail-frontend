import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { incidentsQuery } from "@/api/incidents";
import { monitorsQuery } from "@/api/monitors";
import { statusPageQuery } from "@/api/statusPages";
import { EditorSkeleton } from "@/components/status-pages/EditorSkeleton";
import { StatusPageEditor } from "@/components/status-pages/StatusPageEditor";
import { InAppNotFoundPage } from "@/pages/NotFoundPage";

export function StatusPageEditorPage() {
  const { orgSlug = "", pageId = "" } = useParams();
  const pageQuery = useQuery(statusPageQuery(orgSlug, pageId));
  const { data: monitors } = useQuery(monitorsQuery(orgSlug));
  const { data: incidents } = useQuery(incidentsQuery(orgSlug));

  if (pageQuery.isError || pageQuery.data === null) return <InAppNotFoundPage />;
  if (!pageQuery.data || !monitors || !incidents) return <EditorSkeleton />;
  return (
    <StatusPageEditor
      key={pageQuery.data.id}
      orgSlug={orgSlug}
      page={pageQuery.data}
      monitors={monitors}
      incidents={incidents}
    />
  );
}
