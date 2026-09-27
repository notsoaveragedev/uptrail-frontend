import { useQuery } from "@tanstack/react-query";
import { Segmented, Switch } from "antd";
import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { alertChannelsQuery, useSaveAlertRule } from "@/api/alerts";
import { monitorsQuery } from "@/api/monitors";
import { ChannelIcon } from "@/components/alerts/ChannelIcon";
import { ExpressionText } from "@/components/alerts/ExpressionText";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FieldShell } from "@/components/ui/FieldShell";
import { StatusDot } from "@/components/ui/StatusDot";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { useWindowKeydown } from "@/hooks/useWindowKeydown";
import { print } from "@/lib/alertExpression/print";
import { SEVERITIES, SEVERITY_LABELS } from "@/lib/alerts";
import { PROJECT_OPTIONS } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { AlertRule, Severity } from "@/types/alerts";
import { BacktestPanel } from "./BacktestPanel";
import { ConditionModeToggle } from "./ConditionModeToggle";
import { EditorSection } from "./EditorSection";
import { EscalationSteps } from "./EscalationSteps";
import { ExpressionEditor } from "./ExpressionEditor";
import { RuleEditorHeader } from "./RuleEditorHeader";
import {
  draftFromRule,
  focusField,
  FOR_OPTIONS,
  newDraft,
  ruleFromDraft,
  SEVERITY_DOT,
  visualBlockedReason,
  type RuleErrors,
} from "./ruleFormUtils";
import { useBacktest } from "./useBacktest";
import { useRuleEditor } from "./useRuleEditor";
import { VisualBuilder } from "./VisualBuilder";

type RuleEditorProps = {
  orgSlug: string;
  rule: AlertRule | null;
  initialExpression: string | null;
};

export function RuleEditor({ orgSlug, rule, initialExpression }: RuleEditorProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const [initial] = useState(() => (rule ? draftFromRule(rule) : newDraft(initialExpression ?? undefined)));
  const editor = useRuleEditor(initial);
  const { draft, update, errors } = editor;
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const { data: channels = [] } = useQuery(alertChannelsQuery(orgSlug));
  const saveRule = useSaveAlertRule(orgSlug);
  const [selectedMonitorId, setSelectedMonitorId] = useState("");
  const ids = { name: useId(), project: useId(), channelIds: useId(), expression: useId(), condition: useId() };
  const sectionIds = { basics: useId(), timing: useId(), notify: useId(), severity: useId(), incident: useId() };

  const projectMonitors = monitors.filter((monitor) => monitor.project === draft.project);
  const scopedMonitors =
    draft.monitorIds.length > 0
      ? projectMonitors.filter((monitor) => draft.monitorIds.includes(monitor.id))
      : projectMonitors;
  const backtestMonitorId = scopedMonitors.some((monitor) => monitor.id === selectedMonitorId)
    ? selectedMonitorId
    : (scopedMonitors[0]?.id ?? "");
  const backtest = useBacktest(editor.ast, draft.forSeconds, backtestMonitorId);
  const channelOptions = channels.map((channel) => ({
    value: channel.id,
    label: (
      <span className="inline-flex items-center gap-1.5">
        <ChannelIcon type={channel.type} className="size-3.5" />
        {channel.name}
      </span>
    ),
  }));

  const title = draft.name.trim() || (rule ? rule.name : "New rule");
  const listPath = paths.alertRules(orgSlug);
  const { allowLeave } = useUnsavedChangesGuard({
    isDirty: editor.isDirty && !saveRule.isSuccess,
    title: rule ? "Discard your changes?" : "Discard this rule?",
    description: rule ? `Your edits to ${rule.name} haven't been saved.` : "This rule hasn't been saved yet.",
  });

  useWindowKeydown((event) => {
    if (event.key.toLowerCase() !== "s" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    save();
  });

  function reportConditionError() {
    if (editor.parsed.ok || editor.mode === "visual") {
      toast.error("Complete every condition", "Each condition in the builder needs a value.");
      return;
    }
    const { line, column, message } = editor.parsed.error;
    toast.error("Fix the condition", `${line}:${column} ${message}`);
    focusField(ids.expression);
  }

  function reportFieldErrors(fieldErrors: RuleErrors) {
    toast.error("Some fields need attention", Object.values(fieldErrors)[0]);
    const firstKey = (Object.keys(ids) as (keyof typeof ids)[]).find((key) => key in fieldErrors);
    focusField(firstKey ? ids[firstKey] : undefined);
  }

  async function save() {
    if (saveRule.isPending) return;
    const { isValid, errors: fieldErrors } = editor.validate();
    if (!editor.ast) return reportConditionError();
    if (!isValid) return reportFieldErrors(fieldErrors);

    try {
      const saved = await saveRule.mutateAsync(ruleFromDraft({ ...draft, expression: print(editor.ast) }, rule));
      allowLeave();
      toast.success(rule ? "Rule saved" : "Rule created", `${saved.name} is evaluated on every check from now on.`);
      navigate(listPath);
    } catch {
      toast.error("Couldn't save the rule", "Check your connection and try again.", { label: "Retry", onClick: save });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <title>{`${title} · Alert rules · Uptrail`}</title>
      <RuleEditorHeader
        orgSlug={orgSlug}
        title={title}
        isNew={!rule}
        isDirty={editor.isDirty}
        validity={editor.validity}
        fireCount={backtest.isValid && !backtest.isRunning ? (backtest.result?.count ?? null) : null}
        isSaving={saveRule.isPending}
        onCancel={() => navigate(listPath)}
        onSave={save}
      />

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <div className="w-full min-w-0 rounded-lg border border-line bg-card xl:flex-1">
          <EditorSection title="Basics" titleId={sectionIds.basics}>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <CustomInput
                id={ids.name}
                label="Name"
                size="middle"
                value={draft.name}
                placeholder="Checkout p95 regression"
                maxLength={80}
                onChange={(event) => update({ name: event.target.value })}
                error={errors.name}
              />
              <CustomSelect<string>
                id={ids.project}
                label="Project"
                size="middle"
                value={draft.project}
                onChange={(project) => update({ project, monitorIds: [] })}
                options={PROJECT_OPTIONS}
                error={errors.project}
              />
            </div>
            <CustomSelect<string[]>
              label="Monitors"
              mode="multiple"
              size="middle"
              allowClear
              placeholder="All monitors in the project"
              value={draft.monitorIds}
              onChange={(monitorIds) => update({ monitorIds })}
              options={projectMonitors.map((monitor) => ({ value: monitor.id, label: monitor.name }))}
              showSearch={{ optionFilterProp: "label" }}
              hint={
                draft.monitorIds.length === 0
                  ? `Applies to all ${projectMonitors.length} monitors, including ones added later.`
                  : undefined
              }
            />
          </EditorSection>

          <EditorSection
            title="Condition"
            titleId={ids.condition}
            extra={
              <ConditionModeToggle
                mode={editor.mode}
                visualBlockedReason={visualBlockedReason(editor.parsed)}
                onChange={editor.switchMode}
              />
            }
          >
            {editor.mode === "visual" ? (
              <div className="flex flex-col gap-3">
                <VisualBuilder tree={editor.tree} onChange={editor.updateTree} />
                <div className="flex items-baseline gap-2 rounded-md bg-panel px-3 py-2">
                  <span className="text-caps font-semibold tracking-wider text-subtle uppercase">Expression</span>
                  {editor.validity === "valid" ? (
                    <ExpressionText expression={draft.expression} />
                  ) : (
                    <span role="status" className="text-xs text-degraded">
                      Complete every condition to update the expression.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <ExpressionEditor
                id={ids.expression}
                labelId={ids.condition}
                value={draft.expression}
                error={editor.parsed.ok ? null : editor.parsed.error}
                onChange={(expression) => update({ expression })}
              />
            )}
          </EditorSection>

          <EditorSection title="Timing & severity" titleId={sectionIds.timing}>
            <div className="flex flex-wrap items-start gap-x-8 gap-y-4">
              <div className="w-36">
                <CustomSelect<number>
                  label="For"
                  size="middle"
                  value={draft.forSeconds}
                  onChange={(forSeconds) => update({ forSeconds })}
                  options={FOR_OPTIONS}
                />
              </div>
              <FieldShell label="Severity" labelId={sectionIds.severity}>
                <Segmented<Severity>
                  aria-labelledby={sectionIds.severity}
                  value={draft.severity}
                  onChange={(severity) => update({ severity })}
                  options={SEVERITIES.map((severity) => ({
                    value: severity,
                    label: (
                      <span className="flex items-center gap-1.5">
                        <StatusDot fill={SEVERITY_DOT[severity]} />
                        {SEVERITY_LABELS[severity]}
                      </span>
                    ),
                  }))}
                />
              </FieldShell>
              <FieldShell label="Incident" htmlFor={sectionIds.incident}>
                <span className="flex h-8 items-center gap-2">
                  <Switch
                    id={sectionIds.incident}
                    size="small"
                    checked={draft.autoIncident}
                    onChange={(autoIncident) => update({ autoIncident })}
                  />
                  <span className="text-muted">Auto-open when it fires</span>
                </span>
              </FieldShell>
            </div>
          </EditorSection>

          <EditorSection title="Notify" titleId={sectionIds.notify}>
            <CustomSelect<string[]>
              id={ids.channelIds}
              label="Channels"
              mode="multiple"
              size="middle"
              placeholder="Pick where alerts go"
              value={draft.channelIds}
              onChange={(channelIds) => update({ channelIds })}
              options={channelOptions}
              error={errors.channelIds}
            />
            <EscalationSteps
              steps={draft.escalation}
              channelOptions={channelOptions}
              error={errors.escalation}
              onChange={(escalation) => update({ escalation })}
            />
          </EditorSection>
        </div>

        <BacktestPanel
          result={backtest.result}
          isValid={backtest.isValid}
          isRunning={backtest.isRunning}
          isError={backtest.isError}
          monitors={scopedMonitors}
          monitorId={backtestMonitorId}
          onMonitorChange={setSelectedMonitorId}
          onRerun={() => backtest.rerun()}
        />
      </div>
    </div>
  );
}
