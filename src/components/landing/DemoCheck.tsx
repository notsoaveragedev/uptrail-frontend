import { Alert, Button } from "antd";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { LuArrowRight, LuPlay } from "react-icons/lu";
import { Link } from "react-router";
import { TestResultView } from "@/components/monitor-form/TestResultView";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { fakeRequest } from "@/lib/fakeRequest";
import { DEMO_EXAMPLES, DEMO_INPUT_ID, DEMO_PLACEHOLDER_RESULT } from "@/lib/landing";
import { DEFAULT_TIMEOUT_MS, displayUrl } from "@/lib/monitors";
import { demoCheckSchema } from "@/lib/schemas";
import { runFakeTest, type TestResult } from "@/mocks/monitorTest";
import { Container } from "./Container";

export function DemoCheck() {
  const formRef = useRef<HTMLFormElement>(null);
  const [url, setUrl] = useState(DEMO_EXAMPLES[0]);
  const [result, setResult] = useState<TestResult | null>(null);
  const titleId = useId();

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: demoCheckSchema,
    onSubmit: async (values) => {
      await fakeRequest(900);
      setResult(runFakeTest({ url: values.url, method: "GET", timeoutMs: DEFAULT_TIMEOUT_MS, region: "BOM" }));
    },
  });

  function tryExample(example: string) {
    flushSync(() => setUrl(example));
    formRef.current?.requestSubmit();
  }

  return (
    <section id="try" aria-labelledby={titleId} className="scroll-mt-20 pb-24">
      <Container>
        <div className="grid overflow-hidden rounded-xl border border-line bg-card lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex min-w-0 flex-col gap-6 p-6 lg:p-8">
            <div className="flex flex-col gap-2">
              <h2 id={titleId} className="text-lg font-semibold tracking-tight">
                Run a real check right now.
              </h2>
              <p className="text-body text-pretty text-muted">
                One request from Mumbai, timed through DNS, connect, TLS, first byte and download. Nothing is saved.
              </p>
            </div>

            <form {...formProps} ref={formRef} className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <CustomInput
                    id={DEMO_INPUT_ID}
                    name="url"
                    aria-label="URL to check"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://your-site.com"
                    inputMode="url"
                    autoComplete="url"
                    spellCheck={false}
                    className="font-mono text-sm"
                    error={fieldErrors.url}
                  />
                </div>
                <Button size="large" htmlType="submit" icon={<LuPlay />} loading={isPending}>
                  Run
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-xs text-subtle">
                Try
                {DEMO_EXAMPLES.map((example) => (
                  <Button
                    key={example}
                    type="text"
                    size="small"
                    disabled={isPending}
                    onClick={() => tryExample(example)}
                    className="font-mono text-xs"
                  >
                    {displayUrl(example)}
                  </Button>
                ))}
              </div>
            </form>

            {formError && <Alert type="error" showIcon title={formError} />}
          </div>

          <div className="min-w-0 border-t border-line bg-panel p-6 lg:border-t-0 lg:border-l lg:p-8">
            {result && !fieldErrors.url ? <DemoResult result={result} /> : <ExampleResult />}
          </div>
        </div>
        <p aria-live="polite" className="sr-only">
          {result && !isPending && `${result.statusCode ?? ""} ${result.statusText} in ${result.totalMs} ms`}
        </p>
      </Container>
    </section>
  );
}

function DemoResult({ result }: { result: TestResult }) {
  return (
    <div className="flex flex-col gap-5">
      <TestResultView result={result} showBody={false} />
      {result.ok ? (
        <Link to="/signup" className="flex items-center gap-1.5 font-medium">
          Monitor this URL every 30 seconds
          <LuArrowRight aria-hidden className="size-3.5" />
        </Link>
      ) : (
        <p className="font-medium text-down">This is the moment Uptrail would alert you.</p>
      )}
    </div>
  );
}

function ExampleResult() {
  return (
    <div className="flex flex-col gap-5">
      <div aria-hidden className="opacity-40">
        <TestResultView result={DEMO_PLACEHOLDER_RESULT} showBody={false} />
      </div>
      <p className="text-xs text-subtle">Example result for shopnest.in. Run a check to see yours.</p>
    </div>
  );
}
