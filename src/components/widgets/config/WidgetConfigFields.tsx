import { useQuery } from "@tanstack/react-query";
import { InputNumber, Segmented, Switch, Tabs } from "antd";
import { useId, type ReactNode } from "react";
import { useParams } from "react-router";
import { monitorsQuery } from "@/api/monitors";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { OVERRIDE_RANGES } from "@/lib/widgetConfig";
import { monitorOptions } from "@/lib/widgetFormat";
import type { DashboardRange } from "@/types/dashboard";

const INHERIT = "inherit";

type ConfigTabsProps = {
  data: ReactNode;
  display: ReactNode;
  thresholds?: ReactNode;
  dataLabel?: string;
};

export function ConfigTabs({ data, display, thresholds, dataLabel = "Data" }: ConfigTabsProps) {
  const items = [
    { key: "data", label: dataLabel, children: <TabBody>{data}</TabBody> },
    { key: "display", label: "Display", children: <TabBody>{display}</TabBody> },
    ...(thresholds ? [{ key: "thresholds", label: "Thresholds", children: <TabBody>{thresholds}</TabBody> }] : []),
  ];
  return <Tabs items={items} />;
}

function TabBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5 pt-1">{children}</div>;
}

type MonitorsFieldProps = {
  value: string[];
  onChange: (monitorIds: string[]) => void;
  maxCount?: number;
  error?: string;
};

export function MonitorsField({ value, onChange, maxCount, error }: MonitorsFieldProps) {
  const { orgSlug = "" } = useParams();
  const { data: monitors = [], isPending } = useQuery(monitorsQuery(orgSlug));

  return (
    <CustomSelect<string[]>
      label="Monitors"
      mode="multiple"
      value={value}
      onChange={onChange}
      options={monitorOptions(monitors)}
      loading={isPending}
      maxCount={maxCount}
      maxTagCount="responsive"
      optionFilterProp="label"
      placeholder="All active monitors"
      allowClear
      error={error}
      hint={
        maxCount
          ? `Up to ${maxCount} monitors, charted in series order.`
          : "Leave empty to include every active monitor."
      }
    />
  );
}

type ChoiceFieldProps<Value extends string | number> = {
  label: string;
  value: Value;
  options: readonly Value[];
  labels?: Partial<Record<Value, string>>;
  onChange: (value: Value) => void;
  hint?: string;
};

export function SegmentedField<Value extends string | number>({
  label,
  value,
  options,
  labels = {},
  onChange,
  hint,
}: ChoiceFieldProps<Value>) {
  const labelId = useId();

  return (
    <FieldShell label={label} labelId={labelId} hint={hint}>
      <Segmented<Value>
        aria-labelledby={labelId}
        value={value}
        onChange={onChange}
        options={options.map((option) => ({ value: option, label: labels[option] ?? String(option) }))}
        block
      />
    </FieldShell>
  );
}

export function SelectField<Value extends string | number>({
  label,
  value,
  options,
  labels = {},
  onChange,
  hint,
}: ChoiceFieldProps<Value>) {
  return (
    <CustomSelect<Value>
      label={label}
      value={value}
      onChange={onChange}
      hint={hint}
      options={options.map((option) => ({ value: option, label: labels[option] ?? String(option) }))}
    />
  );
}

type RangeOverrideFieldProps = {
  value: DashboardRange | null;
  onChange: (range: (typeof OVERRIDE_RANGES)[number] | null) => void;
};

export function RangeOverrideField({ value, onChange }: RangeOverrideFieldProps) {
  const current = OVERRIDE_RANGES.find((range) => range === value) ?? INHERIT;

  return (
    <SegmentedField
      label="Time range"
      value={current}
      options={[INHERIT, ...OVERRIDE_RANGES]}
      labels={{ [INHERIT]: "Inherit" }}
      onChange={(next) => onChange(next === INHERIT ? null : next)}
      hint="Inherit follows the dashboard's range picker."
    />
  );
}

type TitleFieldProps = {
  value: string;
  error: string | null;
  onChange: (title: string) => void;
};

export function TitleField({ value, error, onChange }: TitleFieldProps) {
  return (
    <CustomInput
      label="Title"
      value={value}
      maxLength={60}
      error={error}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

type SwitchFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SwitchField({ label, description, checked, onChange }: SwitchFieldProps) {
  const id = useId();

  return (
    <div className="flex items-start gap-3">
      <Switch id={id} checked={checked} onChange={onChange} />
      <div className="flex flex-col">
        <label htmlFor={id} className="cursor-pointer font-medium text-ink">
          {label}
        </label>
        <span className="text-xs text-muted">{description}</span>
      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  hint?: string;
};

export function NumberField({ label, value, onChange, unit, error, hint, ...props }: NumberFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <FieldShell label={label} htmlFor={id} error={error} hint={hint} messageId={messageId}>
      <InputNumber<number>
        {...props}
        id={id}
        size="large"
        className="w-full"
        value={value}
        onChange={onChange}
        suffix={unit && <span className="font-mono text-xs text-subtle">{unit}</span>}
        status={error ? "error" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
      />
    </FieldShell>
  );
}

type ThresholdFieldsProps = {
  warn: number | null;
  critical: number | null;
  onChange: (key: "warn" | "critical", value: number | null) => void;
  errors: Record<string, string>;
  unit: string;
  isHigherBad: boolean;
};

export function ThresholdFields({ warn, critical, onChange, errors, unit, isHigherBad }: ThresholdFieldsProps) {
  const direction = isHigherBad ? "above" : "below";

  return (
    <>
      <p className="text-xs text-muted">
        Values {direction} a threshold turn amber or red, and charts draw them as dashed lines. Leave a field empty to
        turn it off.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Warn"
          value={warn}
          onChange={(value) => onChange("warn", value)}
          unit={unit}
          min={0}
          placeholder="Off"
          error={errors.warn}
        />
        <NumberField
          label="Critical"
          value={critical}
          onChange={(value) => onChange("critical", value)}
          unit={unit}
          min={0}
          placeholder="Off"
          error={errors.critical}
        />
      </div>
    </>
  );
}
