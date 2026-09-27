import { useQueryClient } from "@tanstack/react-query";
import { Button, Tabs } from "antd";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { updateMonitor } from "@/api/monitors";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useMonitorForm } from "@/hooks/useMonitorForm";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { displayUrl } from "@/lib/monitors";
import {
  changedFields,
  configFromMonitor,
  EDIT_TABS,
  isSameForm,
  MONITOR_TYPES,
  updatedMonitor,
  type StepKey,
} from "@/lib/monitorForm";
import type { Monitor } from "@/types/monitor";
import { ChangeSummaryModal } from "./ChangeSummaryModal";
import { StepFields } from "./StepFields";
import { TestPanel } from "./TestPanel";

type EditMonitorFormProps = {
  orgSlug: string;
  monitor: Monitor;
};

export function EditMonitorForm({ orgSlug, monitor }: EditMonitorFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialValues] = useState(() => configFromMonitor(monitor));
  const { values, errors, update, validate } = useMonitorForm(initialValues);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const detailPath = `/o/${orgSlug}/monitors/${monitor.id}`;
  const tab = EDIT_TABS.find((item) => item.key === searchParams.get("tab"))?.key ?? "request";
  const isDirty = !isSameForm(values, initialValues);
  const changes = changedFields(initialValues, values);
  const typeOption = MONITOR_TYPES.find((option) => option.value === values.type);
  const { allowLeave } = useUnsavedChangesGuard({
    isDirty,
    title: "Discard your changes?",
    description: `Your edits to ${monitor.name} haven't been saved.`,
  });

  function changeTab(key: string) {
    setSearchParams(
      (params) => {
        if (key === "request") params.delete("tab");
        else params.set("tab", key);
        return params;
      },
      { replace: true },
    );
  }

  function reviewChanges() {
    const invalidStep = validate(["type", ...EDIT_TABS.map((item) => item.key)]);
    if (!invalidStep) return setIsReviewOpen(true);
    if (invalidStep !== "type") changeTab(invalidStep);
    toast.error("Some fields need attention", `Check the ${stepLabel(invalidStep)} tab.`);
  }

  async function save() {
    setIsSaving(true);
    await updateMonitor(queryClient, orgSlug, updatedMonitor(monitor, values));
    allowLeave();
    toast.success("Monitor updated", `${values.name.trim()} uses the new config from the next check.`);
    navigate(detailPath);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 tabIndex={-1} className="text-lg font-semibold tracking-tight outline-none">
            Edit {monitor.name}
          </h1>
          <p className="truncate font-mono text-xs text-muted">
            {monitor.method} {displayUrl(monitor.url)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span role="status" className="mr-2 flex items-center gap-1.5 text-xs text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-degraded" />
              {changes.length} unsaved {changes.length === 1 ? "change" : "changes"}
            </span>
          )}
          <Button onClick={() => navigate(detailPath)}>Cancel</Button>
          <Button type="primary" disabled={!isDirty} onClick={reviewChanges}>
            Save changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <section
          aria-label="Monitor settings"
          className="w-full min-w-0 rounded-lg border border-line bg-card xl:flex-1"
        >
          <div className="border-b border-line px-5 py-4">
            <CustomSelect
              label="Monitor type"
              value={values.type}
              onChange={(type) => update({ type })}
              options={MONITOR_TYPES.map(({ value, label }) => ({ value, label }))}
              hint={typeOption?.description}
              className="w-full sm:max-w-72"
            />
          </div>
          <Tabs
            activeKey={tab}
            onChange={changeTab}
            className="px-5 pb-5"
            items={EDIT_TABS.map((item) => ({
              key: item.key,
              label: item.label,
              children: (
                <StepFields
                  step={item.key as Exclude<StepKey, "review" | "type">}
                  values={values}
                  errors={errors}
                  onChange={update}
                />
              ),
            }))}
          />
        </section>
        <TestPanel values={values} />
      </div>

      <ChangeSummaryModal
        open={isReviewOpen}
        changes={changes}
        isSaving={isSaving}
        onConfirm={save}
        onCancel={() => setIsReviewOpen(false)}
      />
    </div>
  );
}

function stepLabel(step: StepKey) {
  return EDIT_TABS.find((item) => item.key === step)?.label ?? "Type";
}
