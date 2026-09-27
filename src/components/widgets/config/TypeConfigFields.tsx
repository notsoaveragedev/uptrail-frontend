import { Input } from "antd";
import { useId } from "react";
import { FieldShell } from "@/components/ui/FieldShell";
import {
  AGGREGATION_LABELS,
  AGGREGATIONS,
  configEditor,
  HEATMAP_SORT_LABELS,
  HEATMAP_SORTS,
  heatmapConfigSchema,
  histogramConfigSchema,
  KPI_STAT_LABELS,
  KPI_STATS,
  kpiConfigSchema,
  LATENCY_METRICS,
  latencyChartConfigSchema,
  liveLogConfigSchema,
  LOG_FILTER_LABELS,
  LOG_FILTERS,
  MAX_CHART_MONITORS,
  METRIC_LABELS,
  REGION_METRIC_LABELS,
  REGION_METRICS,
  regionMapConfigSchema,
  SLOWEST_LIMITS,
  slowestConfigSchema,
  textConfigSchema,
  timelineConfigSchema,
} from "@/lib/widgetConfig";
import type { WidgetConfigProps } from "@/types/dashboard";
import {
  ConfigTabs,
  MonitorsField,
  NumberField,
  RangeOverrideField,
  SegmentedField,
  SelectField,
  SwitchField,
  ThresholdFields,
  TitleField,
} from "./WidgetConfigFields";

export function LatencyChartConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, errors, set, title, titleError, setTitle } = configEditor(latencyChartConfigSchema, widget, onChange);

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField
            value={config.monitorIds}
            onChange={(ids) => set("monitorIds", ids)}
            maxCount={MAX_CHART_MONITORS}
            error={errors.monitorIds}
          />
          <SegmentedField
            label="Metric"
            value={config.metric}
            options={LATENCY_METRICS}
            labels={METRIC_LABELS}
            onChange={(metric) => set("metric", metric)}
          />
          <SegmentedField
            label="Aggregation"
            value={config.aggregation}
            options={AGGREGATIONS}
            labels={AGGREGATION_LABELS}
            onChange={(aggregation) => set("aggregation", aggregation)}
          />
          <RangeOverrideField value={config.rangeOverride} onChange={(range) => set("rangeOverride", range)} />
        </>
      }
      display={
        <>
          <TitleField value={title} error={titleError} onChange={setTitle} />
          <SwitchField
            label="Show legend"
            description="Colored ticks with each monitor's name above the chart."
            checked={config.showLegend}
            onChange={(showLegend) => set("showLegend", showLegend)}
          />
        </>
      }
      thresholds={
        <ThresholdFields
          warn={config.warn}
          critical={config.critical}
          onChange={set}
          errors={errors}
          unit="ms"
          isHigherBad
        />
      }
    />
  );
}

export function KpiConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, errors, set, title, titleError, setTitle } = configEditor(kpiConfigSchema, widget, onChange);
  const isUptime = config.stat === "uptime";

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField value={config.monitorIds} onChange={(ids) => set("monitorIds", ids)} />
          <SelectField
            label="Stat"
            value={config.stat}
            options={KPI_STATS}
            labels={KPI_STAT_LABELS}
            onChange={(stat) => set("stat", stat)}
          />
          <SegmentedField
            label="Aggregation"
            value={config.aggregation}
            options={["avg", "max"] as const}
            labels={AGGREGATION_LABELS}
            onChange={(aggregation) => set("aggregation", aggregation)}
            hint="Worst takes the lowest uptime or the highest latency across monitors."
          />
          <RangeOverrideField value={config.rangeOverride} onChange={(range) => set("rangeOverride", range)} />
        </>
      }
      display={
        <>
          <TitleField value={title} error={titleError} onChange={setTitle} />
          <SwitchField
            label="Show sparkline"
            description="A small trend line next to the value."
            checked={config.showSparkline}
            onChange={(showSparkline) => set("showSparkline", showSparkline)}
          />
          {isUptime && (
            <NumberField
              label="Decimals"
              value={config.decimals}
              onChange={(decimals) => set("decimals", decimals ?? 0)}
              min={0}
              max={3}
              error={errors.decimals}
            />
          )}
        </>
      }
      thresholds={
        <ThresholdFields
          warn={config.warn}
          critical={config.critical}
          onChange={set}
          errors={errors}
          unit={isUptime ? "%" : config.stat === "incidents" ? "" : "ms"}
          isHigherBad={!isUptime}
        />
      }
    />
  );
}

export function HeatmapConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, set, title, titleError, setTitle } = configEditor(heatmapConfigSchema, widget, onChange);

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField value={config.monitorIds} onChange={(ids) => set("monitorIds", ids)} />
          <RangeOverrideField value={config.rangeOverride} onChange={(range) => set("rangeOverride", range)} />
        </>
      }
      display={
        <>
          <TitleField value={title} error={titleError} onChange={setTitle} />
          <SegmentedField
            label="Sort rows"
            value={config.sort}
            options={HEATMAP_SORTS}
            labels={HEATMAP_SORT_LABELS}
            onChange={(sort) => set("sort", sort)}
          />
        </>
      }
    />
  );
}

export function HistogramConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, set, title, titleError, setTitle } = configEditor(histogramConfigSchema, widget, onChange);

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField value={config.monitorIds} onChange={(ids) => set("monitorIds", ids)} />
          <RangeOverrideField value={config.rangeOverride} onChange={(range) => set("rangeOverride", range)} />
        </>
      }
      display={<TitleField value={title} error={titleError} onChange={setTitle} />}
    />
  );
}

export function TimelineConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, set, title, titleError, setTitle } = configEditor(timelineConfigSchema, widget, onChange);

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField value={config.monitorIds} onChange={(ids) => set("monitorIds", ids)} />
          <RangeOverrideField value={config.rangeOverride} onChange={(range) => set("rangeOverride", range)} />
        </>
      }
      display={<TitleField value={title} error={titleError} onChange={setTitle} />}
    />
  );
}

export function RegionMapConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, errors, set, title, titleError, setTitle } = configEditor(regionMapConfigSchema, widget, onChange);
  const isUptime = config.metric === "uptime";

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField value={config.monitorIds} onChange={(ids) => set("monitorIds", ids)} />
          <SegmentedField
            label="Metric"
            value={config.metric}
            options={REGION_METRICS}
            labels={REGION_METRIC_LABELS}
            onChange={(metric) => set("metric", metric)}
          />
          <RangeOverrideField value={config.rangeOverride} onChange={(range) => set("rangeOverride", range)} />
        </>
      }
      display={<TitleField value={title} error={titleError} onChange={setTitle} />}
      thresholds={
        <ThresholdFields
          warn={config.warn}
          critical={config.critical}
          onChange={set}
          errors={errors}
          unit={isUptime ? "%" : "ms"}
          isHigherBad={!isUptime}
        />
      }
    />
  );
}

export function SlowestConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, errors, set, title, titleError, setTitle } = configEditor(slowestConfigSchema, widget, onChange);

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField value={config.monitorIds} onChange={(ids) => set("monitorIds", ids)} />
          <SegmentedField
            label="Metric"
            value={config.metric}
            options={LATENCY_METRICS}
            labels={METRIC_LABELS}
            onChange={(metric) => set("metric", metric)}
          />
          <RangeOverrideField value={config.rangeOverride} onChange={(range) => set("rangeOverride", range)} />
        </>
      }
      display={
        <>
          <TitleField value={title} error={titleError} onChange={setTitle} />
          <SegmentedField
            label="Show"
            value={config.limit}
            options={SLOWEST_LIMITS}
            labels={{ 5: "Top 5", 10: "Top 10" }}
            onChange={(limit) => set("limit", limit)}
          />
        </>
      }
      thresholds={
        <ThresholdFields
          warn={config.warn}
          critical={config.critical}
          onChange={set}
          errors={errors}
          unit="ms"
          isHigherBad
        />
      }
    />
  );
}

export function LiveLogConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, errors, set, title, titleError, setTitle } = configEditor(liveLogConfigSchema, widget, onChange);

  return (
    <ConfigTabs
      data={
        <>
          <MonitorsField value={config.monitorIds} onChange={(ids) => set("monitorIds", ids)} />
          <SegmentedField
            label="Show"
            value={config.statusFilter}
            options={LOG_FILTERS}
            labels={LOG_FILTER_LABELS}
            onChange={(statusFilter) => set("statusFilter", statusFilter)}
          />
        </>
      }
      display={
        <>
          <TitleField value={title} error={titleError} onChange={setTitle} />
          <NumberField
            label="Max lines"
            value={config.maxLines}
            onChange={(maxLines) => set("maxLines", maxLines ?? 10)}
            min={10}
            max={200}
            step={10}
            error={errors.maxLines}
            hint="Older lines drop off the bottom as new checks stream in."
          />
        </>
      }
    />
  );
}

export function TextConfigFields({ widget, onChange }: WidgetConfigProps) {
  const { config, errors, set, title, titleError, setTitle } = configEditor(textConfigSchema, widget, onChange);
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <ConfigTabs
      dataLabel="Content"
      data={
        <FieldShell
          label="Markdown"
          htmlFor={id}
          error={errors.markdown}
          messageId={messageId}
          hint="Supports headings, lists, **bold**, `code` and [links](https://uptrail.dev)."
        >
          <Input.TextArea
            id={id}
            value={config.markdown}
            onChange={(event) => set("markdown", event.target.value)}
            autoSize={{ minRows: 8, maxRows: 16 }}
            className="font-mono text-xs"
            status={errors.markdown ? "error" : undefined}
            aria-invalid={errors.markdown ? true : undefined}
            aria-describedby={errors.markdown ? messageId : undefined}
          />
        </FieldShell>
      }
      display={<TitleField value={title} error={titleError} onChange={setTitle} />}
    />
  );
}
