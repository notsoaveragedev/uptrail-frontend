import { LuCircleAlert, LuCircleCheck, LuCircleX, LuTriangleAlert, LuWrench } from "react-icons/lu";
import { affectedComponents, TONE_SURFACE } from "@/lib/publicStatus";
import { TONE_TEXT } from "@/lib/status";
import { OVERALL_STATUS_LABELS, OVERALL_STATUS_TONE } from "@/lib/statusTheme";
import type { OverallStatus, StatusSnapshot } from "@/types/statusPage";

const ICONS: Record<OverallStatus, typeof LuCircleCheck> = {
  operational: LuCircleCheck,
  degraded: LuTriangleAlert,
  partial_outage: LuCircleAlert,
  major_outage: LuCircleX,
  maintenance: LuWrench,
};

export function OverallBanner({ snapshot }: { snapshot: StatusSnapshot }) {
  const tone = OVERALL_STATUS_TONE[snapshot.overall];
  const Icon = ICONS[snapshot.overall];
  const affected = affectedComponents(snapshot).map((item) => item.name);

  return (
    <section className={`flex items-start gap-3 rounded-lg border px-5 py-4 ${TONE_SURFACE[tone]}`}>
      <Icon aria-hidden className={`mt-0.5 size-5 shrink-0 ${TONE_TEXT[tone]}`} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-md font-semibold">{OVERALL_STATUS_LABELS[snapshot.overall]}</h2>
        {affected.length > 0 && <p className="text-muted">Affected: {affected.join(", ")}</p>}
      </div>
    </section>
  );
}
