import { Button, Collapse } from "antd";
import { useId, useState } from "react";
import { LuCircleCheck, LuCircleX, LuPlay } from "react-icons/lu";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { fakeRequest } from "@/lib/fakeRequest";
import { jsonTokens, type JsonTokenKind } from "@/lib/jsonTokens";
import { isHttpUrl, type MonitorFormValues } from "@/lib/monitorForm";
import { DEFAULT_TIMEOUT_MS } from "@/lib/monitors";
import { TONE_BADGE } from "@/lib/status";
import { TIMING_PHASES } from "@/lib/timing";
import { runFakeTest, type TestResult } from "@/mocks/monitorTest";

const TOKEN_TEXT: Record<JsonTokenKind, string> = {
  key: "text-series-2",
  string: "text-ink",
  literal: "text-series-4",
  plain: "text-muted",
};

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

function TestResultView({ result }: { result: TestResult }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-caps font-semibold tracking-wider text-subtle uppercase">
        Last result · <TimeAgo timestamp={result.ranAt} intervalMs={15_000} />
      </span>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <StatusPill result={result} />
        <span className="font-mono text-lg font-medium whitespace-nowrap">
          {result.totalMs.toLocaleString()} <span className="text-md text-muted">ms</span>
        </span>
      </div>

      <div aria-hidden className="flex h-2 gap-px overflow-hidden rounded-sm">
        {TIMING_PHASES.filter((phase) => result.timings[phase.key] > 0).map((phase) => (
          <span key={phase.key} style={{ flexGrow: result.timings[phase.key] }} className={phase.fill} />
        ))}
      </div>

      <dl className="flex flex-col gap-1.5">
        {TIMING_PHASES.map((phase) => (
          <div key={phase.key} className="flex items-center gap-2 text-xs">
            <span aria-hidden className={`size-2 rounded-xs ${phase.fill}`} />
            <dt className="flex-1 text-muted">{phase.label}</dt>
            <dd className="font-mono text-ink">{result.timings[phase.key]} ms</dd>
          </div>
        ))}
      </dl>

      {result.body && <ResponseBody body={result.body} sizeBytes={result.sizeBytes} />}
    </div>
  );
}

function StatusPill({ result }: { result: TestResult }) {
  const Icon = result.ok ? LuCircleCheck : LuCircleX;
  return (
    <span
      className={`flex h-6.5 items-center gap-1.5 rounded-md px-2 font-medium whitespace-nowrap ${
        TONE_BADGE[result.ok ? "up" : "down"]
      }`}
    >
      <Icon aria-hidden className="size-3.5" />
      {result.statusCode && <span className="font-mono">{result.statusCode}</span>}
      {result.statusText}
    </span>
  );
}

function ResponseBody({ body, sizeBytes }: { body: string; sizeBytes: number }) {
  return (
    <Collapse
      size="small"
      defaultActiveKey={["body"]}
      items={[
        {
          key: "body",
          label: "Response body",
          extra: <span className="font-mono text-xs text-muted">{sizeBytes} B</span>,
          children: (
            <pre className="m-0 overflow-x-auto font-mono text-xs leading-4.5">
              {body.split("\n").map((line, index) => (
                <div key={index}>
                  {jsonTokens(line).map((token, tokenIndex) => (
                    <span key={tokenIndex} className={TOKEN_TEXT[token.kind]}>
                      {token.text}
                    </span>
                  ))}
                </div>
              ))}
            </pre>
          ),
        },
      ]}
      className="text-xs"
    />
  );
}
