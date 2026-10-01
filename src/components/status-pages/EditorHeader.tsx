import { Button, Tooltip } from "antd";
import { LuExternalLink } from "react-icons/lu";
import { Link } from "react-router";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusDot } from "@/components/ui/StatusDot";
import { paths } from "@/lib/paths";
import { pageAddress } from "@/lib/statusPages";
import type { StatusPage } from "@/types/statusPage";

type EditorHeaderProps = {
  orgSlug: string;
  page: StatusPage;
  isPublished: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  onSave: () => void;
  onTogglePublish: () => void;
};

export function EditorHeader({
  orgSlug,
  page,
  isPublished,
  isDirty,
  isSaving,
  isPublishing,
  onSave,
  onTogglePublish,
}: EditorHeaderProps) {
  const title = page.title.trim() || "Untitled page";

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
        <Link to={paths.statusPages(orgSlug)}>Status pages</Link>
        <span aria-hidden className="text-faint">
          /
        </span>
        <span aria-current="page" className="truncate text-ink">
          {title}
        </span>
      </nav>
      <PageHeader
        title={title}
        meta={
          <MetaList role="status">
            <StatusBadge status={isPublished ? "up" : "paused"} label={isPublished ? "Published" : "Draft"} />
            <span className="flex items-center gap-1.5">
              {isDirty && <StatusDot fill="bg-degraded" />}
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <span className="font-mono text-xs">{pageAddress(page)}</span>
          </MetaList>
        }
        actions={
          <>
            <Button icon={<LuExternalLink />} href={paths.publicStatus(page.slug)} target="_blank">
              View live
            </Button>
            <Tooltip
              title={
                <span className="flex items-center gap-1.5">
                  Save <kbd className="kbd">⌘S</kbd>
                </span>
              }
            >
              <Button
                type={isPublished ? "primary" : "default"}
                disabled={!isDirty}
                loading={isSaving}
                onClick={onSave}
              >
                Save
              </Button>
            </Tooltip>
            <Button type={isPublished ? "default" : "primary"} loading={isPublishing} onClick={onTogglePublish}>
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
          </>
        }
      />
    </div>
  );
}
