import { useQuery } from "@tanstack/react-query";
import { Alert, Button, DatePicker, Drawer, Input, Segmented } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { LuGlobe, LuX } from "react-icons/lu";
import { useParams } from "react-router";
import { maintenanceQuery, useSaveMaintenance } from "@/api/maintenance";
import { monitorsQuery } from "@/api/monitors";
import { orgSettingsQuery } from "@/api/org";
import { SwitchField } from "@/components/ui/SwitchField";
import { DrawerSection } from "@/components/logs/drawer/DrawerSection";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { StatusDot } from "@/components/ui/StatusDot";
import { useForm } from "@/hooks/useForm";
import { useNow } from "@/hooks/useNow";
import { useProjectOptions } from "@/hooks/useProject";
import { useToast } from "@/hooks/useToast";
import { HOUR_MS } from "@/lib/dates";
import { formatDateTime, formatElapsed } from "@/lib/format";
import { buildMaintenance, nextOccurrences, overlapping, recurrenceFrom, type RepeatFreq } from "@/lib/maintenance";
import { maintenanceSchema } from "@/lib/schemas";
import { STATUS_FILL } from "@/lib/status";
import { formatInZone, localTimezone, timezoneOptions } from "@/lib/timezones";
import { currentUser } from "@/mocks/workspace";
import type { MaintenanceWindow } from "@/types/maintenance";
import { WeekdayPicker } from "./WeekdayPicker";

export type MaintenanceDraft = { entry: MaintenanceWindow | null; copyOf?: MaintenanceWindow; startsAt?: number };

type MaintenanceDrawerProps = {
  draft: MaintenanceDraft | null;
  onClose: () => void;
};

export function MaintenanceDrawer({ draft, onClose }: MaintenanceDrawerProps) {
  return (
    <Drawer
      open={draft !== null}
      onClose={onClose}
      placement="right"
      size="36rem"
      closable={false}
      title={null}
      destroyOnHidden
      aria-labelledby="maintenance-drawer-title"
      styles={{ body: { padding: 0 } }}
    >
      {draft && <MaintenanceForm draft={draft} onClose={onClose} />}
    </Drawer>
  );
}

function MaintenanceForm({ draft, onClose }: { draft: MaintenanceDraft; onClose: () => void }) {
  const projectOptions = useProjectOptions();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const save = useSaveMaintenance(orgSlug);
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { data: windows = [] } = useQuery(maintenanceQuery(orgSlug));
  const { data: settings } = useQuery(orgSettingsQuery(orgSlug));
  const now = useNow(60_000);
  const { entry } = draft;
  const source = entry ?? draft.copyOf;
  const [initialStart] = useState(() => draft.startsAt ?? source?.startsAt ?? Date.now());
  const [project, setProject] = useState(source?.project ?? projectOptions[0]?.value ?? "");
  const [monitorIds, setMonitorIds] = useState(source?.monitorIds ?? []);
  const [startsAt, setStartsAt] = useState(initialStart);
  const [endsAt, setEndsAt] = useState(initialStart + (source ? source.endsAt - source.startsAt : 2 * HOUR_MS));
  const [timezone, setTimezone] = useState(source?.timezone ?? settings?.timezone ?? localTimezone());
  const [freq, setFreq] = useState<RepeatFreq>(source?.recurrence?.freq ?? "none");
  const [weekdays, setWeekdays] = useState(
    (source?.recurrence?.weekdays ?? [new Date(initialStart).getDay()]).map(String),
  );
  const [until, setUntil] = useState(source?.recurrence?.until ?? 0);
  const [showOnStatusPage, setShowOnStatusPage] = useState(source?.showOnStatusPage ?? true);

  const projectMonitors = monitors.filter((monitor) => monitor.project === project);
  const preview: MaintenanceWindow = {
    ...(source ?? { title: "", description: "", createdBy: "", createdAt: 0 }),
    id: entry?.id ?? "",
    project,
    monitorIds,
    startsAt,
    endsAt,
    timezone,
    recurrence: recurrenceFrom(freq, weekdays, until),
    showOnStatusPage,
  };
  const upcoming = freq === "none" ? [] : nextOccurrences(preview, Math.min(now, startsAt), 3);
  const conflicts = monitorIds.length && endsAt > startsAt ? overlapping(preview, windows) : [];
  const local = localTimezone();

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: maintenanceSchema,
    onSubmit: async (values) => {
      const next = buildMaintenance(values, entry, currentUser.name);
      await save.mutateAsync(next);
      onClose();
      toast.success(
        entry ? "Maintenance updated" : "Maintenance scheduled",
        `${next.title} · ${formatDateTime(next.startsAt)}`,
      );
    },
  });

  function changeProject(next: string) {
    setProject(next);
    setMonitorIds([]);
  }

  return (
    <form {...formProps} className="flex min-h-full flex-col">
      <header className="flex items-start gap-3 border-b border-line px-5 py-4">
        <h2 id="maintenance-drawer-title" className="flex-1 text-md font-semibold">
          {entry ? `Edit ${entry.title}` : "Schedule maintenance"}
        </h2>
        <Button type="text" aria-label="Close" icon={<LuX />} onClick={onClose} />
      </header>
      {formError && <Alert type="error" showIcon title={formError} className="mx-5 mt-4" />}

      <DrawerSection title="Details">
        <CustomInput
          label="Title"
          name="title"
          size="middle"
          autoFocus
          defaultValue={entry?.title ?? (draft.copyOf && `${draft.copyOf.title} (copy)`)}
          placeholder="Database migration"
          error={fieldErrors.title}
        />
        <div>
          <input type="hidden" name="project" value={project} />
          <CustomSelect
            label="Project"
            size="middle"
            value={project}
            onChange={changeProject}
            options={projectOptions}
          />
        </div>
        <FieldShell
          label="Description"
          htmlFor="maintenance-description"
          hint="Shown on the status page when published."
        >
          <Input.TextArea
            id="maintenance-description"
            name="description"
            rows={2}
            defaultValue={source?.description}
            placeholder="What's changing and what users might notice"
          />
        </FieldShell>
      </DrawerSection>

      <DrawerSection title="Affected monitors">
        <input type="hidden" name="monitorIds" value={monitorIds.join(",")} />
        <CustomSelect
          aria-label="Affected monitors"
          mode="multiple"
          size="middle"
          placeholder="Pick monitors"
          value={monitorIds}
          onChange={setMonitorIds}
          optionFilterProp="title"
          maxTagCount="responsive"
          error={fieldErrors.monitorIds}
          options={projectMonitors.map((monitor) => ({
            value: monitor.id,
            title: monitor.name,
            label: (
              <span className="flex items-center gap-2">
                <StatusDot fill={STATUS_FILL[monitor.status]} />
                {monitor.name}
              </span>
            ),
          }))}
          hint={
            <button
              type="button"
              className="cursor-pointer text-accent hover:text-accent-hover"
              onClick={() => setMonitorIds(projectMonitors.map((monitor) => monitor.id))}
            >
              Select all {projectMonitors.length} in this project
            </button>
          }
        />
        <p className="text-xs text-muted">Alerts for these monitors are paused during the window.</p>
      </DrawerSection>

      <DrawerSection title="Schedule">
        <input type="hidden" name="startsAt" value={startsAt} />
        <input type="hidden" name="endsAt" value={endsAt} />
        <input type="hidden" name="timezone" value={timezone} />
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldShell label="Starts" htmlFor="maintenance-start">
            <DatePicker
              id="maintenance-start"
              showTime={{ format: "HH:mm", minuteStep: 5 }}
              format="ddd D MMM, HH:mm"
              allowClear={false}
              value={dayjs(startsAt)}
              onChange={(value) => {
                if (!value) return;
                const next = value.valueOf();
                setEndsAt(next + (endsAt - startsAt));
                setStartsAt(next);
              }}
            />
          </FieldShell>
          <FieldShell
            label="Ends"
            htmlFor="maintenance-end"
            error={fieldErrors.endsAt}
            messageId="maintenance-end-error"
          >
            <DatePicker
              id="maintenance-end"
              showTime={{ format: "HH:mm", minuteStep: 5 }}
              format="ddd D MMM, HH:mm"
              allowClear={false}
              status={fieldErrors.endsAt ? "error" : undefined}
              value={dayjs(endsAt)}
              onChange={(value) => value && setEndsAt(value.valueOf())}
            />
          </FieldShell>
        </div>
        <CustomSelect
          label="Timezone"
          size="middle"
          showSearch
          optionFilterProp="label"
          value={timezone}
          onChange={setTimezone}
          options={timezoneOptions()}
          hint={
            endsAt > startsAt && (
              <span>
                <span className="font-mono text-ink">{formatElapsed(endsAt - startsAt)}</span> ·{" "}
                {formatInZone(startsAt, timezone, true)}–{formatInZone(endsAt, timezone)} there
                {timezone !== local && (
                  <>
                    {" "}
                    · {formatInZone(startsAt, local)}–{formatInZone(endsAt, local)} your time
                  </>
                )}
              </span>
            )
          }
        />
      </DrawerSection>

      <DrawerSection title="Repeat">
        <input type="hidden" name="freq" value={freq} />
        <input type="hidden" name="weekdays" value={weekdays.join(",")} />
        <input type="hidden" name="until" value={until} />
        <Segmented
          aria-label="Repeat"
          value={freq}
          onChange={setFreq}
          options={[
            { value: "none", label: "Doesn't repeat" },
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
          ]}
          className="w-fit"
        />
        {freq === "weekly" && (
          <FieldShell label="On" labelId="maintenance-weekdays" error={fieldErrors.weekdays} messageId="weekdays-error">
            <WeekdayPicker labelId="maintenance-weekdays" value={weekdays} onChange={setWeekdays} />
          </FieldShell>
        )}
        {freq !== "none" && (
          <>
            <FieldShell
              label="Until"
              htmlFor="maintenance-until"
              error={fieldErrors.until}
              hint="Leave empty to repeat forever."
            >
              <DatePicker
                id="maintenance-until"
                placeholder="Forever"
                format="D MMM YYYY"
                value={until ? dayjs(until) : null}
                onChange={(value) => setUntil(value ? value.endOf("day").valueOf() : 0)}
              />
            </FieldShell>
            {upcoming.length > 0 && (
              <p className="text-xs text-muted">
                Next:{" "}
                <span className="font-mono text-ink">
                  {upcoming.map((item) => formatDateTime(item.start)).join(" · ")}
                </span>
              </p>
            )}
          </>
        )}
      </DrawerSection>

      <DrawerSection title="Visibility">
        <SwitchField
          name="showOnStatusPage"
          icon={<LuGlobe aria-hidden className="size-3.5 text-subtle" />}
          label="Show on status page"
          hint="Listed as scheduled maintenance, with the affected components."
          checked={showOnStatusPage}
          onChange={setShowOnStatusPage}
        />
        {conflicts.length > 0 && (
          <Alert
            type="warning"
            showIcon
            title={`Overlaps with ${conflicts.map((item) => item.title).join(", ")}`}
            description="Some of these monitors are already in maintenance then. That's fine, but check it's intended."
          />
        )}
      </DrawerSection>
      <div className="sticky bottom-0 mt-auto flex justify-end gap-2 border-t border-line bg-card px-5 py-3">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          {entry ? "Save changes" : "Schedule"}
        </Button>
      </div>
    </form>
  );
}
