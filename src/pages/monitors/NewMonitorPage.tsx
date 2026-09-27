import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { addMonitors, monitorsQuery } from "@/api/monitors";
import { ReviewStep } from "@/components/monitor-form/ReviewStep";
import { StepFields } from "@/components/monitor-form/StepFields";
import { StepHeading } from "@/components/monitor-form/StepHeading";
import { StepRail } from "@/components/monitor-form/StepRail";
import { TestPanel } from "@/components/monitor-form/TestPanel";
import { WizardFooter } from "@/components/monitor-form/WizardFooter";
import { WizardHeader } from "@/components/monitor-form/WizardHeader";
import { useMonitorDraft } from "@/hooks/useMonitorDraft";
import { useMonitorForm } from "@/hooks/useMonitorForm";
import { useToast } from "@/hooks/useToast";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { readDraft } from "@/lib/monitorDraft";
import { DEFAULT_VALUES, isSameForm, STEPS } from "@/lib/monitorForm";
import { formatInterval } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import { createdMonitor } from "@/mocks/monitorFactory";

export function NewMonitorPage() {
  const { orgSlug = "" } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [restoredDraft] = useState(() => readDraft(orgSlug));
  const { values, errors, update, validate, reset } = useMonitorForm(restoredDraft?.values ?? DEFAULT_VALUES);
  const [step, setStep] = useState(restoredDraft?.step ?? 0);
  const [furthest, setFurthest] = useState(restoredDraft?.step ?? 0);
  const [isCreating, setIsCreating] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMovedRef = useRef(false);
  const hasAnnouncedDraftRef = useRef(false);

  const isDirty = !isSameForm(values, DEFAULT_VALUES);
  const draft = useMonitorDraft({ orgSlug, values, step, isDirty, initialSavedAt: restoredDraft?.savedAt ?? null });
  const monitorsPath = paths.monitors(orgSlug);
  const { allowLeave } = useUnsavedChangesGuard({
    isDirty,
    title: "Leave the new monitor?",
    description: "Your draft stays saved on this device, so you can finish it later.",
  });

  useEffect(() => {
    if (!hasMovedRef.current) return;
    headingRef.current?.focus();
  }, [step]);

  const announceDraft = useEffectEvent(() => {
    toast.info("Draft restored", "Picked up where you left off.", { label: "Discard draft", onClick: discardDraft });
  });

  useEffect(() => {
    if (!restoredDraft || hasAnnouncedDraftRef.current) return;
    hasAnnouncedDraftRef.current = true;
    announceDraft();
  }, [restoredDraft]);

  function discardDraft() {
    draft.clear();
    reset(DEFAULT_VALUES);
    moveTo(0);
    setFurthest(0);
    toast.success("Draft discarded", "Starting a new monitor from scratch.");
  }

  function moveTo(index: number) {
    hasMovedRef.current = true;
    setStep(index);
    setFurthest((current) => Math.max(current, index));
  }

  function goToStep(index: number) {
    if (index <= step) return moveTo(index);
    const invalidStep = validate(STEPS.slice(step, index).map((item) => item.key));
    const target = invalidStep ? STEPS.findIndex((item) => item.key === invalidStep) : index;
    moveTo(target);
  }

  function next() {
    if (step === STEPS.length - 1) return createMonitor();
    goToStep(step + 1);
  }

  async function createMonitor() {
    const invalidStep = validate(STEPS.map((item) => item.key));
    if (invalidStep) return moveTo(STEPS.findIndex((item) => item.key === invalidStep));

    setIsCreating(true);
    await queryClient.ensureQueryData(monitorsQuery(orgSlug));
    await addMonitors(queryClient, orgSlug, [createdMonitor(values)]);
    draft.clear();
    allowLeave();
    toast.success(
      "Monitor created",
      `${values.name.trim()} checks every ${formatInterval(values.intervalSec)} from ${values.regions.join(", ")}.`,
    );
    navigate(monitorsPath);
  }

  function saveDraft() {
    draft.save();
    toast.success("Draft saved", "Your progress is saved on this device.");
  }

  const current = STEPS[step];

  return (
    <>
      <title>New monitor · Uptrail</title>
      <div className="flex flex-col items-start justify-center gap-4 xl:flex-row">
        <section className="flex w-full max-w-220 min-w-0 flex-col rounded-lg border border-line bg-card xl:flex-1">
          <WizardHeader step={step} savedAt={draft.savedAt} onClose={() => navigate(monitorsPath)} />
          <div className="flex flex-1">
            <StepRail current={step} furthest={furthest} onSelect={goToStep} />
            <div className="flex min-w-0 flex-1 flex-col gap-5 px-6 py-5">
              <StepHeading ref={headingRef} title={current.label} description={current.description} />
              {current.key === "review" ? (
                <ReviewStep values={values} onEdit={goToStep} />
              ) : (
                <StepFields step={current.key} values={values} errors={errors} onChange={update} />
              )}
            </div>
          </div>
          <WizardFooter
            step={step}
            isCreating={isCreating}
            onBack={() => moveTo(step - 1)}
            onSaveDraft={saveDraft}
            onNext={next}
          />
        </section>
        <TestPanel values={values} />
      </div>
    </>
  );
}
