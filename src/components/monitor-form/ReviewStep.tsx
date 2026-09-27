import { Button } from "antd";
import { LuPencil } from "react-icons/lu";
import { reviewSections, STEPS, type MonitorFormValues } from "@/lib/monitorForm";

type ReviewStepProps = {
  values: MonitorFormValues;
  onEdit: (stepIndex: number) => void;
};

export function ReviewStep({ values, onEdit }: ReviewStepProps) {
  return (
    <div className="flex flex-col divide-y divide-line rounded-lg border border-line">
      {reviewSections(values).map((section) => (
        <section key={section.step} aria-label={section.title} className="flex flex-col gap-2 px-4 py-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-caps font-semibold tracking-wider text-subtle uppercase">{section.title}</h3>
            <Button
              type="text"
              size="small"
              icon={<LuPencil />}
              aria-label={`Edit ${section.title}`}
              onClick={() => onEdit(STEPS.findIndex((step) => step.key === section.step))}
              className="text-muted"
            >
              Edit
            </Button>
          </div>
          <dl className="grid grid-cols-[9rem_minmax(0,1fr)] gap-x-4 gap-y-1.5">
            {section.rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-muted">{row.label}</dt>
                <dd
                  className={`break-all whitespace-pre-line text-ink ${row.isMono ? "font-mono text-xs leading-5" : ""}`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
