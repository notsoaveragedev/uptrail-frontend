import { useQuery } from "@tanstack/react-query";
import { Button, Dropdown, Popover } from "antd";
import { useState } from "react";
import { LuCode, LuEllipsis, LuExternalLink, LuPencil, LuTrash2 } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router";
import { subscribersQuery } from "@/api/statusPages";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { Card } from "@/components/ui/Card";
import { MetaList } from "@/components/ui/MetaList";
import { editedAgo } from "@/lib/dashboards";
import { projectLabel } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import { pageAddress, snapshotDays, snapshotUptime } from "@/lib/statusPages";
import type { StatusPage, StatusSnapshot } from "@/types/statusPage";
import { BadgeEmbed } from "./BadgeEmbed";
import { MiniUptimeStrip } from "./MiniUptimeStrip";
import { OverallStatusBadge } from "./OverallStatusBadge";
import { PageLogo } from "./PageLogo";

type StatusPageCardProps = {
  page: StatusPage;
  snapshot: StatusSnapshot;
  now: number;
  onDelete: (page: StatusPage) => void;
};

export function StatusPageCard({ page, snapshot, now, onDelete }: StatusPageCardProps) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();
  const { data: subscribers } = useQuery(subscribersQuery(orgSlug, page.id));
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);
  const editPath = paths.statusPageEdit(orgSlug, page.id);
  const livePath = paths.publicStatus(page.slug);

  const menuItems = [
    { key: "badge", icon: <LuCode />, label: "Copy badge", onClick: () => setIsBadgeOpen(true) },
    { type: "divider" as const },
    { key: "delete", icon: <LuTrash2 />, label: "Delete", danger: true, onClick: () => onDelete(page) },
  ];

  return (
    <li className="group">
      <Card isInteractive className="h-full">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start gap-3">
            <PageLogo title={page.title} logoUrl={page.logoUrl} color={page.theme.primary} />
            <div className="flex min-w-0 flex-1 flex-col">
              <Link to={editPath} className="truncate text-md font-semibold text-ink hover:text-ink hover:underline">
                {page.title}
              </Link>
              <span className="text-xs text-subtle">{projectLabel(page.project)}</span>
            </div>
            <StatusBadge status={page.published ? "up" : "paused"} label={page.published ? "Published" : "Draft"} />
          </div>
          <a
            href={livePath}
            target="_blank"
            rel="noreferrer"
            className="flex w-fit max-w-full items-center gap-1.5 font-mono text-xs text-muted hover:text-ink"
          >
            <span className="truncate">{pageAddress(page)}</span>
            <LuExternalLink aria-hidden className="size-3 shrink-0" />
          </a>
          <div className="flex flex-col gap-2">
            <div>
              <OverallStatusBadge status={snapshot.overall} />
            </div>
            <MiniUptimeStrip days={snapshotDays(snapshot)} uptime={snapshotUptime(snapshot)} />
          </div>
        </div>
        <footer className="mt-auto flex items-center justify-between gap-3 border-t border-line py-2 pr-2 pl-4">
          <MetaList className="text-xs text-muted">
            <span>
              <span className="font-mono text-ink">{subscribers?.length ?? "—"}</span> subscribers
            </span>
            <span>edited {editedAgo(page.updatedAt, now)}</span>
          </MetaList>
          <div
            className={`flex items-center gap-1 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 ${isBadgeOpen ? "opacity-100" : "opacity-0"}`}
          >
            <Button size="small" type="text" icon={<LuPencil />} onClick={() => navigate(editPath)}>
              Edit
            </Button>
            <Button size="small" type="text" icon={<LuExternalLink />} href={livePath} target="_blank">
              View live
            </Button>
            <Popover
              open={isBadgeOpen}
              onOpenChange={(open) => !open && setIsBadgeOpen(false)}
              trigger="click"
              placement="bottomRight"
              content={<BadgeEmbed slug={page.slug} title={page.title} status={snapshot.overall} />}
            >
              <Dropdown trigger={["click"]} menu={{ items: menuItems }} placement="bottomRight">
                <Button size="small" type="text" aria-label={`More actions for ${page.title}`} icon={<LuEllipsis />} />
              </Dropdown>
            </Popover>
          </div>
        </footer>
      </Card>
    </li>
  );
}
