import { Collapse } from "antd";
import { LuCircleCheck, LuCircleX } from "react-icons/lu";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { JsonCode } from "@/components/ui/JsonCode";
import { TONE_BADGE } from "@/lib/status";
import { TIMING_PHASES } from "@/lib/timing";
import type { TestResult } from "@/mocks/monitorTest";

export function TestResultView({ result, showBody = true }: { result: TestResult; showBody?: boolean }) {
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

      {showBody && result.body && <ResponseBody body={result.body} sizeBytes={result.sizeBytes} />}
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
          children: <JsonCode code={body} className="leading-4.5" />,
        },
      ]}
      className="text-xs"
    />
  );
}
