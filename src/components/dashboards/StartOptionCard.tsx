import type { DashboardTemplate } from "@/types/dashboard";
import { DashboardThumbnail } from "./DashboardThumbnail";

type StartOptionCardProps = {
  option: DashboardTemplate;
  isSelected?: boolean;
};

export function StartOptionCard({ option, isSelected = false }: StartOptionCardProps) {
  const count = option.widgets.length;

  return (
    <span className="flex flex-col gap-2.5">
      <DashboardThumbnail
        layout={option.layouts.lg}
        widgets={option.widgets}
        className={`h-18 border ${isSelected ? "border-line-strong" : "border-transparent"}`}
      />
      <span className="flex flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-medium text-ink">{option.name}</span>
          {count > 0 && <span className="font-mono text-xs text-subtle">{count} widgets</span>}
        </span>
        <span className="text-xs text-muted">{option.description}</span>
      </span>
    </span>
  );
}
