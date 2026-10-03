import { Button, Dropdown } from "antd";
import { LuCopy, LuDownload, LuEllipsis, LuExternalLink, LuTrash2 } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { editedAgo, layoutFor } from "@/lib/dashboards";
import { plural } from "@/lib/format";
import { projectLabel } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { Dashboard } from "@/types/dashboard";
import { DashboardThumbnail } from "./DashboardThumbnail";

type DashboardCardProps = {
  dashboard: Dashboard;
  now: number;
  actions: {
    open: (dashboard: Dashboard) => void;
    clone: (dashboard: Dashboard) => void;
    exportJson: (dashboard: Dashboard) => void;
    remove: (dashboard: Dashboard) => void;
  };
};

export function DashboardCard({ dashboard, now, actions }: DashboardCardProps) {
  const { orgSlug = "" } = useParams();
  const widgetCount = dashboard.widgets.length;

  const items = [
    { key: "open", icon: <LuExternalLink />, label: "Open", onClick: () => actions.open(dashboard) },
    { key: "clone", icon: <LuCopy />, label: "Clone", onClick: () => actions.clone(dashboard) },
    { key: "export", icon: <LuDownload />, label: "Export JSON", onClick: () => actions.exportJson(dashboard) },
    { type: "divider" as const },
    { key: "delete", icon: <LuTrash2 />, label: "Delete", danger: true, onClick: () => actions.remove(dashboard) },
  ];

  return (
    <li className="group relative">
      <Link to={paths.dashboard(orgSlug, dashboard.id)} className="block rounded-lg text-ink hover:text-ink">
        <Card isInteractive>
          <div className="p-2 pb-0">
            <DashboardThumbnail layout={layoutFor(dashboard, "lg")} widgets={dashboard.widgets} />
          </div>
          <div className="flex flex-col gap-0.5 px-4 pt-3 pb-3.5">
            <span className="truncate pr-8 text-md font-semibold">{dashboard.name}</span>
            <span className="truncate font-mono text-xs text-subtle">
              {projectLabel(dashboard.project)} · {plural(widgetCount, "widget")}
            </span>
          </div>
          <footer className="border-t border-line px-4 py-2.5 text-xs text-muted">
            Edited by {dashboard.updatedBy} · {editedAgo(dashboard.updatedAt, now)}
          </footer>
        </Card>
      </Link>
      <div className="row-actions absolute right-3 bottom-13">
        <Dropdown trigger={["click"]} menu={{ items }} placement="bottomRight">
          <Button size="small" type="text" aria-label={`Actions for ${dashboard.name}`} icon={<LuEllipsis />} />
        </Dropdown>
      </div>
    </li>
  );
}
