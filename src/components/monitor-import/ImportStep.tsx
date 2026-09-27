import { Button, Progress } from "antd";
import { LuCircleCheck } from "react-icons/lu";
import { useNavigate } from "react-router";

type ImportStepProps = {
  total: number;
  completed: number;
  currentName?: string;
  skipped: number;
  isDone: boolean;
  monitorsPath: string;
  onImportAnother: () => void;
};

export function ImportStep({
  total,
  completed,
  currentName,
  skipped,
  isDone,
  monitorsPath,
  onImportAnother,
}: ImportStepProps) {
  const navigate = useNavigate();
  const percent = total ? Math.round((completed / total) * 100) : 0;

  if (!isDone) {
    return (
      <div className="flex flex-col items-center gap-4 px-5 py-16">
        <h2 className="text-md font-semibold">Importing monitors…</h2>
        <div className="w-full max-w-md">
          <Progress percent={percent} showInfo={false} strokeColor="var(--accent)" aria-label="Import progress" />
          <div className="mt-1 flex justify-between gap-3 text-xs text-subtle">
            <span className="truncate">{currentName}</span>
            <span className="shrink-0 font-mono">
              <span className="text-ink">{completed}</span> / {total}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center gap-5 px-5 py-14 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-up-soft">
        <LuCircleCheck aria-hidden className="size-5 text-up" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-md font-semibold">
          {completed} {completed === 1 ? "monitor" : "monitors"} imported
        </h2>
        <p className="text-muted">They'll run their first checks within a minute.</p>
      </div>

      <dl className="grid w-full max-w-sm grid-cols-2 overflow-hidden rounded-lg border border-line text-left">
        <div className="border-r border-line px-4 py-3">
          <dt className="text-caps font-semibold tracking-wider text-subtle uppercase">Imported</dt>
          <dd className="font-mono text-lg text-up">{completed}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="text-caps font-semibold tracking-wider text-subtle uppercase">Skipped</dt>
          <dd className="font-mono text-lg text-ink">{skipped}</dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <Button onClick={onImportAnother}>Import another file</Button>
        <Button type="primary" onClick={() => navigate(monitorsPath)}>
          View monitors
        </Button>
      </div>
    </div>
  );
}
