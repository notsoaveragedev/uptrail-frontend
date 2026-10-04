import { Button } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useFinishOnboarding } from "@/api/onboarding";
import { AlertsStep } from "@/components/onboarding/AlertsStep";
import { BuildPanel } from "@/components/onboarding/BuildPanel";
import { DoneScreen } from "@/components/onboarding/DoneScreen";
import { MonitorStep } from "@/components/onboarding/MonitorStep";
import { OrganizationStep } from "@/components/onboarding/OrganizationStep";
import { ProgressTrail } from "@/components/onboarding/ProgressTrail";
import { ProjectStep } from "@/components/onboarding/ProjectStep";
import { StatusPageStep } from "@/components/onboarding/StatusPageStep";
import { Logo } from "@/components/Logo";
import { StepRail } from "@/components/ui/StepRail";
import { useInterval } from "@/hooks/useInterval";
import { useStoredState } from "@/hooks/useStoredState";
import { useToast } from "@/hooks/useToast";
import { lastOrg } from "@/lib/currentOrg";
import { displayUrl } from "@/lib/monitors";
import {
  complete,
  emptyDraft,
  ONBOARDING_STEPS,
  skip,
  type OnboardingDraft,
  type OnboardingStepKey,
  withStatusPageDefaults,
} from "@/lib/onboarding";
import { paths } from "@/lib/paths";
import { removeStored } from "@/lib/storage";
import { currentUser } from "@/mocks/workspace";
import type { MonitorStatus } from "@/types/monitor";

const DRAFT_KEY = "uptrail:onboarding";
const DONE = "done";
const TRAIL_LENGTH = 30;

export function OnboardingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const finish = useFinishOnboarding();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useStoredState<OnboardingDraft>(DRAFT_KEY, emptyDraft(currentUser.email));
  const [checks, setChecks] = useState<MonitorStatus[]>([]);
  const [finished, setFinished] = useState<OnboardingDraft | null>(null);
  const requested = searchParams.get("step");
  const isDone = finished !== null;
  const requestedIndex = ONBOARDING_STEPS.findIndex((step) => step.key === requested);
  const step = Math.min(requestedIndex >= 0 ? requestedIndex : draft.step, draft.furthest, ONBOARDING_STEPS.length - 1);
  const stepKey = ONBOARDING_STEPS[step].key;

  useInterval(
    () => setChecks((current) => [...current, current.at(-1) ?? "up"]),
    checks.length > 0 && checks.length < TRAIL_LENGTH ? 2000 : null,
  );

  useEffect(() => {
    if (!isDone && requested !== stepKey) setSearchParams({ step: stepKey }, { replace: true });
  }, [isDone, requested, stepKey, setSearchParams]);

  function update<Key extends keyof OnboardingDraft>(key: Key, value: OnboardingDraft[Key]) {
    setDraft({ ...draft, [key]: value });
  }

  function goTo(index: number, next: OnboardingDraft = draft) {
    setDraft({ ...next, step: index });
    setSearchParams({ step: ONBOARDING_STEPS[index]?.key ?? DONE });
  }

  function prepared(key: OnboardingStepKey) {
    return { ...(key === "alerts" ? withStatusPageDefaults(draft) : draft), step };
  }

  function next(key: OnboardingStepKey) {
    const updated = complete(prepared(key), key);
    goTo(updated.step, updated);
  }

  function skipStep(key: OnboardingStepKey) {
    const updated = skip(prepared(key), key);
    goTo(updated.step, updated);
  }

  async function finishSetup() {
    const updated = complete({ ...draft, step }, "status-page");
    try {
      await finish.mutateAsync(updated);
    } catch {
      toast.error("Couldn't finish setup", "Nothing was lost. Try again.");
      return;
    }
    removeStored(DRAFT_KEY);
    setFinished(updated);
    setSearchParams({ step: DONE }, { replace: true });
  }

  function finishLater() {
    const org = lastOrg();
    navigate(org ? paths.overview(org.slug) : paths.account("organizations"));
  }

  const hints: Record<OnboardingStepKey, string | undefined> = {
    organization: draft.organization.slug || undefined,
    project: draft.project.slug || undefined,
    monitor: draft.skipped.includes("monitor") ? "Skipped" : draft.monitor.url && displayUrl(draft.monitor.url),
    alerts: draft.skipped.includes("alerts") ? "Skipped" : draft.furthest > 3 ? draft.alerts.email : undefined,
    "status-page": undefined,
  };

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-canvas">
      <title>Set up Uptrail</title>
      <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-12">
        <Link to="/" aria-label="Uptrail home" className="rounded-md">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {!isDone && (
            <span className="text-xs text-muted">
              Step {step + 1} of {ONBOARDING_STEPS.length}
            </span>
          )}
          {!isDone && (
            <Button type="text" onClick={finishLater}>
              Finish later
            </Button>
          )}
        </div>
      </header>

      <div className="grid md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)_24rem]">
        {isDone ? (
          <div className="hidden border-r border-line md:block" />
        ) : (
          <StepRail
            steps={ONBOARDING_STEPS.map((item) => ({ ...item, hint: hints[item.key] }))}
            label="Setup steps"
            current={step}
            furthest={draft.furthest}
            onSelect={(index) => goTo(index)}
            className="hidden border-r border-line px-4 py-10 md:block"
          />
        )}
        <main className="px-6 pt-12 pb-16 sm:px-12 lg:pt-[10vh]">
          <div key={isDone ? DONE : stepKey} className="w-full max-w-sm">
            {finished && <DoneScreen draft={finished} />}
            {!isDone && stepKey === "organization" && (
              <OrganizationStep
                value={draft.organization}
                onChange={(value) => update("organization", value)}
                onNext={() => next("organization")}
              />
            )}
            {!isDone && stepKey === "project" && (
              <ProjectStep
                orgSlug={draft.organization.slug}
                value={draft.project}
                onChange={(value) => update("project", value)}
                onBack={() => goTo(0)}
                onNext={() => next("project")}
              />
            )}
            {!isDone && stepKey === "monitor" && (
              <MonitorStep
                value={draft.monitor}
                onChange={(value) => update("monitor", value)}
                onTested={(result) => setChecks(result ? [result.ok ? "up" : "down"] : [])}
                onBack={() => goTo(1)}
                onSkip={() => skipStep("monitor")}
                onNext={() => next("monitor")}
              />
            )}
            {!isDone && stepKey === "alerts" && (
              <AlertsStep
                value={draft.alerts}
                hasMonitor={!draft.skipped.includes("monitor")}
                onChange={(value) => update("alerts", value)}
                onBack={() => goTo(2)}
                onSkip={() => skipStep("alerts")}
                onNext={() => next("alerts")}
              />
            )}
            {!isDone && stepKey === "status-page" && (
              <StatusPageStep
                value={draft.statusPage}
                isFinishing={finish.isPending}
                onChange={(value) => update("statusPage", value)}
                onBack={() => goTo(3)}
                onFinish={finishSetup}
              />
            )}
          </div>
        </main>
        <div className="hidden lg:flex">
          <BuildPanel draft={finished ?? draft} checks={checks} isStatusStep={!isDone && stepKey === "status-page"} />
        </div>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-line px-6 py-4 text-xs text-subtle sm:px-12">
        {isDone ? <span>Setup complete</span> : <ProgressTrail current={step} skipped={draft.skipped} />}
        <p className="hidden sm:block">© {new Date().getFullYear()} Uptrail</p>
      </footer>
    </div>
  );
}
