import { Collapse } from "antd";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { CountBadge } from "@/components/ui/CountBadge";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { paths } from "@/lib/paths";
import { componentCount } from "@/lib/statusPages";
import type { Incident } from "@/types/incident";
import type { Monitor } from "@/types/monitor";
import type { StatusPage } from "@/types/statusPage";
import { BrandingSection } from "./BrandingSection";
import { StatusPageDangerZone } from "./StatusPageDangerZone";
import { ComponentsSection } from "./ComponentsSection";
import { DisplaySection } from "./DisplaySection";
import { DomainSection } from "./DomainSection";
import { EditorHeader } from "./EditorHeader";
import { PreviewPane } from "./PreviewPane";
import { SubscriberCount } from "./SubscriberCount";
import { SubscribersSection } from "./SubscribersSection";
import { useStatusPageEditor } from "./useStatusPageEditor";

type StatusPageEditorProps = {
  orgSlug: string;
  page: StatusPage;
  monitors: Monitor[];
  incidents: Incident[];
};

const OPEN_SECTIONS = ["branding", "components"];

export function StatusPageEditor({ orgSlug, page, monitors, incidents }: StatusPageEditorProps) {
  const navigate = useNavigate();
  const editor = useStatusPageEditor(orgSlug, page, () => navigate(paths.statusPages(orgSlug)));
  const { draft, update, change } = editor;

  useWindowKeydown((event) => {
    if (event.key.toLowerCase() !== "s" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    if (editor.isDirty) editor.save();
  });

  const sections = [
    {
      key: "branding",
      label: "Branding",
      children: <BrandingSection page={draft} onChange={update} />,
    },
    {
      key: "components",
      label: (
        <SectionLabel title="Components">
          <CountBadge count={componentCount(draft)} isMuted />
        </SectionLabel>
      ),
      children: <ComponentsSection page={draft} monitors={monitors} onChange={change} />,
    },
    {
      key: "display",
      label: "Display",
      children: <DisplaySection options={draft.options} onChange={(options) => update({ options })} />,
    },
    {
      key: "domain",
      label: "Custom domain",
      children: <DomainSection domain={draft.customDomain} onChange={(customDomain) => update({ customDomain })} />,
    },
    {
      key: "subscribers",
      label: (
        <SectionLabel title="Subscribers">
          <SubscriberCount orgSlug={orgSlug} pageId={page.id} />
        </SectionLabel>
      ),
      children: <SubscribersSection orgSlug={orgSlug} pageId={page.id} slug={draft.slug} />,
    },
    {
      key: "danger",
      label: <span className="text-down">Danger zone</span>,
      children: (
        <StatusPageDangerZone
          isPublished={editor.isPublished}
          onUnpublish={editor.togglePublish}
          onDelete={editor.remove}
        />
      ),
    },
  ].map((section) => ({ ...section, children: <SectionErrorBoundary>{section.children}</SectionErrorBoundary> }));

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-6.5rem)] lg:min-h-[36rem]">
      <title>{`${draft.title.trim() || "Untitled page"} · Status pages · Uptrail`}</title>
      <EditorHeader
        orgSlug={orgSlug}
        page={draft}
        isPublished={editor.isPublished}
        isDirty={editor.isDirty}
        isSaving={editor.isSaving}
        isPublishing={editor.isPublishing}
        onSave={editor.save}
        onTogglePublish={editor.togglePublish}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <aside
          aria-label="Page settings"
          className="shrink-0 overflow-y-auto rounded-lg border border-line bg-card lg:w-104"
        >
          <Collapse ghost defaultActiveKey={OPEN_SECTIONS} items={sections} className="status-page-settings" />
        </aside>
        <PreviewPane page={draft} monitors={monitors} incidents={incidents} />
      </div>
    </div>
  );
}

function SectionLabel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      {title}
      {children}
    </span>
  );
}
