import { Checkbox, Segmented } from "antd";
import { useId } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { toggleItem } from "@/lib/list";
import { INTERVALS, monthlyChecks, type MonitorFieldProps } from "@/lib/monitorForm";
import { formatInterval, PROJECT_OPTIONS, REGIONS, TAGS } from "@/lib/monitors";
import type { RegionCode } from "@/types/monitor";

export function ScheduleStep({ values, errors, onChange }: MonitorFieldProps) {
  const intervalLabelId = useId();
  const regionsLabelId = useId();
  const regionsMessageId = useId();

  function toggleRegion(code: RegionCode) {
    const regions = toggleItem(values.regions, code);
    onChange({ regions: REGIONS.map((region) => region.code).filter((region) => regions.includes(region)) });
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldShell
        label="Check interval"
        labelId={intervalLabelId}
        hint={
          <>
            About <span className="font-mono text-ink">{monthlyChecks(values).toLocaleString()}</span> checks a month
            across {values.regions.length} {values.regions.length === 1 ? "region" : "regions"}.
          </>
        }
      >
        <Segmented
          aria-labelledby={intervalLabelId}
          size="large"
          value={values.intervalSec}
          onChange={(intervalSec) => onChange({ intervalSec })}
          options={INTERVALS.map((seconds) => ({ value: seconds, label: formatInterval(seconds) }))}
          className="self-start font-mono"
        />
      </FieldShell>

      <FieldShell label="Regions" labelId={regionsLabelId} error={errors.regions} messageId={regionsMessageId}>
        <div
          role="group"
          aria-labelledby={regionsLabelId}
          aria-describedby={errors.regions ? regionsMessageId : undefined}
          className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {REGIONS.map((region) => {
            const isChecked = values.regions.includes(region.code);
            return (
              <label
                key={region.code}
                className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                  isChecked ? "border-line-strong bg-hover" : "border-line hover:border-line-strong"
                }`}
              >
                <Checkbox checked={isChecked} onChange={() => toggleRegion(region.code)} />
                <span className="font-mono text-xs font-semibold text-ink">{region.code}</span>
                <span className="text-muted">{region.city}</span>
              </label>
            );
          })}
        </div>
      </FieldShell>

      <div className="grid items-start gap-4 sm:grid-cols-2">
        <CustomSelect
          label="Project"
          value={values.project}
          onChange={(project) => onChange({ project })}
          options={PROJECT_OPTIONS}
          error={errors.project}
        />
        <CustomSelect
          label="Tags"
          mode="tags"
          value={values.tags}
          onChange={(tags) => onChange({ tags })}
          options={TAGS.map((tag) => ({ value: tag, label: tag }))}
          placeholder="Add tags"
          maxTagCount="responsive"
          tokenSeparators={[","]}
        />
      </div>
    </div>
  );
}
