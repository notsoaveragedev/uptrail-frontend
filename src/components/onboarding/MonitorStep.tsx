import { Alert, Button, Segmented } from "antd";
import { useState } from "react";
import { LuPlay } from "react-icons/lu";
import { AuthHeading } from "@/components/auth/AuthHeading";
import { StatusBadge } from "@/components/monitors/StatusBadge";
import { CustomInput } from "@/components/ui/CustomInput";
import { FieldShell } from "@/components/ui/FieldShell";
import { useForm } from "@/hooks/useForm";
import { fakeRequest } from "@/lib/fakeRequest";
import { latencyText } from "@/lib/format";
import { isHttpUrl } from "@/lib/monitorForm";
import { DEFAULT_TIMEOUT_MS } from "@/lib/monitors";
import { INTERVAL_PRESETS, monitorNameFromUrl, type OnboardingDraft } from "@/lib/onboarding";
import { onboardingMonitorSchema } from "@/lib/schemas";
import { runFakeTest, type TestResult } from "@/mocks/monitorTest";
import { StepFooter } from "./StepFooter";

type MonitorStepProps = {
  value: OnboardingDraft["monitor"];
  onChange: (value: OnboardingDraft["monitor"]) => void;
  onTested: (result: TestResult | null) => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
};

export function MonitorStep({ value, onChange, onTested, onBack, onSkip, onNext }: MonitorStepProps) {
  const [isNameEdited, setIsNameEdited] = useState(Boolean(value.name && value.name !== monitorNameFromUrl(value.url)));
  const [result, setResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const { formProps, fieldErrors, isPending } = useForm({
    schema: onboardingMonitorSchema,
    onSubmit: async () => onNext(),
  });

  function changeUrl(url: string) {
    setResult(null);
    onTested(null);
    onChange({ ...value, url, name: isNameEdited ? value.name : monitorNameFromUrl(url) });
  }

  async function testNow() {
    setIsTesting(true);
    await fakeRequest(900);
    const next = runFakeTest({ url: value.url.trim(), method: "GET", timeoutMs: DEFAULT_TIMEOUT_MS, region: "BOM" });
    setIsTesting(false);
    setResult(next);
    onTested(next);
  }

  return (
    <form {...formProps}>
      <AuthHeading
        route="POST /monitors"
        title="What should we watch?"
        description="Paste a URL. We'll check it from Mumbai, Frankfurt and Virginia and keep a 90-day history."
      />
      <div className="flex flex-col gap-4">
        <CustomInput
          label="URL"
          name="url"
          type="text"
          inputMode="url"
          autoFocus
          placeholder="https://api.acme.com/health"
          value={value.url}
          onChange={(event) => changeUrl(event.target.value)}
          error={fieldErrors.url}
          className="font-mono"
        />
        <div className="flex flex-col gap-2">
          <Button
            icon={<LuPlay />}
            disabled={!isHttpUrl(value.url)}
            loading={isTesting}
            onClick={testNow}
            className="w-fit"
          >
            Test now
          </Button>
          <div aria-live="polite">
            {result && (
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 font-mono text-xs text-muted">
                  <StatusBadge status={result.ok ? "up" : "down"} />
                  {result.statusCode ?? "No response"} {result.statusText} · {latencyText(result.totalMs)} from{" "}
                  {result.region}
                </span>
                {!result.ok && (
                  <Alert
                    type="warning"
                    showIcon
                    title={`It returned ${result.statusCode ?? "nothing"}. You can still add it; we'll alert you if it stays down.`}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        <CustomInput
          label="Name"
          name="name"
          placeholder="Acme API"
          value={value.name}
          onChange={(event) => {
            setIsNameEdited(true);
            onChange({ ...value, name: event.target.value });
          }}
          error={fieldErrors.name}
        />
        <FieldShell label="Check every" labelId="onboarding-interval">
          <Segmented
            aria-labelledby="onboarding-interval"
            value={value.intervalSec}
            onChange={(intervalSec) => onChange({ ...value, intervalSec })}
            options={INTERVAL_PRESETS}
            className="w-fit"
          />
        </FieldShell>
        <p className="text-xs text-muted">We'll alert you when it's down for 2 checks in a row.</p>
      </div>
      <StepFooter continueLabel="Add monitor" isPending={isPending} onBack={onBack} onSkip={onSkip} />
    </form>
  );
}
