import { Segmented, Switch } from "antd";
import { useId } from "react";
import { FieldShell } from "@/components/ui/FieldShell";
import { HISTORY_DAY_OPTIONS } from "@/lib/statusPages";
import type { StatusPage } from "@/types/statusPage";

type Options = StatusPage["options"];

type DisplaySectionProps = {
  options: Options;
  onChange: (options: Options) => void;
};

export function DisplaySection({ options, onChange }: DisplaySectionProps) {
  const historyId = useId();

  function update(patch: Partial<Options>) {
    onChange({ ...options, ...patch });
  }

  return (
    <div className="flex flex-col gap-4">
      <SwitchRow
        label="Uptime bars"
        description="A 90-day strip under every component."
        checked={options.showUptimeBars}
        onChange={(showUptimeBars) => update({ showUptimeBars })}
      />
      <SwitchRow
        label="Response times"
        description="A latency sparkline on components with Chart on."
        checked={options.showResponseTimes}
        onChange={(showResponseTimes) => update({ showResponseTimes })}
      />
      <FieldShell label="Incident history" labelId={historyId}>
        <Segmented<number>
          block
          aria-labelledby={historyId}
          value={options.historyDays}
          onChange={(historyDays) => update({ historyDays })}
          options={HISTORY_DAY_OPTIONS.map((days) => ({ value: days, label: `${days} days` }))}
        />
      </FieldShell>
    </div>
  );
}

type SwitchRowProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function SwitchRow({ label, description, checked, onChange }: SwitchRowProps) {
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="flex flex-col">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-xs text-muted">{description}</span>
      </label>
      <Switch id={id} size="small" checked={checked} onChange={onChange} className="mt-0.5" />
    </div>
  );
}
