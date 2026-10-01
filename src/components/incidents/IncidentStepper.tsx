import { Steps } from "antd";
import { formatClock } from "@/lib/format";
import { INCIDENT_STATUS_LABELS, INCIDENT_STATUS_TONE, incidentStages, type IncidentStage } from "@/lib/incidents";
import { TONE_TEXT } from "@/lib/status";
import type { Incident } from "@/types/incident";

export function IncidentStepper({ incident }: { incident: Incident }) {
  const stages = incidentStages(incident);

  return (
    <Steps
      size="small"
      aria-label="Incident lifecycle"
      current={stages.findIndex((stage) => stage.isCurrent)}
      className="rounded-lg border border-line bg-card px-4 py-3"
      items={stages.map((stage, index) => ({
        key: stage.status,
        classNames: { rail: stages[index + 1]?.isReached ? "border-muted" : "border-line-strong" },
        icon: <StageDot stage={stage} />,
        title: (
          <span className={stage.isCurrent ? "font-medium text-ink" : stage.isReached ? "text-muted" : "text-subtle"}>
            {INCIDENT_STATUS_LABELS[stage.status]}
          </span>
        ),
        content: <StageTime stage={stage} />,
      }))}
    />
  );
}

function StageDot({ stage }: { stage: IncidentStage }) {
  const tone = TONE_TEXT[INCIDENT_STATUS_TONE[stage.status]];
  if (stage.isCurrent) {
    return (
      <span className={`flex size-4 items-center justify-center rounded-full border border-current ${tone}`}>
        <span className="size-2 rounded-full bg-current" />
      </span>
    );
  }
  return (
    <span
      className={`block size-4 rounded-full border ${stage.isReached && stage.at ? "border-ink bg-ink" : "border-line-strong"}`}
    />
  );
}

function StageTime({ stage }: { stage: IncidentStage }) {
  if (stage.at) return <span className="font-mono text-xs text-subtle">{formatClock(stage.at)}</span>;
  return stage.isReached ? <span className="text-xs text-faint">Skipped</span> : null;
}
