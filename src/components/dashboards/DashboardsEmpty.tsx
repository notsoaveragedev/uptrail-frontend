import { LuLayoutDashboard } from "react-icons/lu";
import { START_OPTIONS } from "@/lib/dashboards";
import { StartOptionCard } from "./StartOptionCard";

export function DashboardsEmpty({ onPick }: { onPick: (templateId: string) => void }) {
  const templates = START_OPTIONS.slice(1);

  return (
    <section aria-labelledby="dashboards-empty-title" className="flex flex-col gap-5 rounded-lg border border-line p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-line text-muted">
          <LuLayoutDashboard aria-hidden className="size-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h2 id="dashboards-empty-title" className="text-md font-semibold">
            No dashboards yet
          </h2>
          <p className="text-muted">Start from a template or build one from scratch.</p>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {templates.map((template) => (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => onPick(template.id)}
              className="w-full cursor-pointer rounded-lg border border-line p-2.5 text-left transition-colors hover:border-line-strong"
            >
              <StartOptionCard option={template} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
