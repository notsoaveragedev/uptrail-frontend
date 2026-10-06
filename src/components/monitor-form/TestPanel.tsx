import { Button } from "antd";
import { useId, useState } from "react";
import { LuPlay } from "react-icons/lu";
import { fakeRequest } from "@/lib/fakeRequest";
import { isHttpUrl, type MonitorFormValues } from "@/lib/monitorForm";
import { DEFAULT_TIMEOUT_MS } from "@/lib/monitors";
import { runFakeTest, type TestResult } from "@/mocks/monitorTest";
import { TestResultView } from "./TestResultView";

type TestPanelProps = {
  values: MonitorFormValues;
};

export function TestPanel({ values }: TestPanelProps) {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const isUrlValid = isHttpUrl(values.url);
  const region = values.regions[0] ?? "BOM";
  const titleId = useId();
  const hintId = useId();

  async function runTest() {
    setIsRunning(true);
    await fakeRequest(900);
    setResult(
      runFakeTest({
        url: values.url.trim(),
        method: values.method,
        timeoutMs: Number(values.timeoutMs) || DEFAULT_TIMEOUT_MS,
        region,
      }),
    );
    setIsRunning(false);
  }

  return (
    <aside
      aria-labelledby={titleId}
      className="flex w-full shrink-0 flex-col gap-3.5 rounded-lg border border-line bg-card p-4 xl:sticky xl:top-6 xl:w-72"
    >
      <div className="flex items-center justify-between">
        <h2 id={titleId} className="text-md font-semibold">
          Test request
        </h2>
        <span className="text-xs text-muted">
          from <span className="font-mono">{region}</span>
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Button
          size="large"
          icon={<LuPlay />}
          onClick={runTest}
          loading={isRunning}
          disabled={!isUrlValid}
          aria-describedby={isUrlValid ? undefined : hintId}
        >
          {isRunning ? "Testing…" : "Test now"}
        </Button>
        {!isUrlValid && (
          <span id={hintId} className="text-xs text-muted">
            {values.url.trim() ? "Fix the URL to run a test." : "Enter a URL to run a test."}
          </span>
        )}
      </div>

      <div aria-live="polite" className="border-t border-line pt-3">
        {result ? (
          <TestResultView result={result} />
        ) : (
          <p className="text-xs text-muted">
            Runs one check right now and shows the status, timing breakdown and response, without saving anything.
          </p>
        )}
      </div>
    </aside>
  );
}
