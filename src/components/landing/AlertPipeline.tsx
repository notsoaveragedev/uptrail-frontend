import { useId, useRef } from "react";
import { IncidentStatusPill } from "@/components/incidents/IncidentStatusPill";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { StatusIcon } from "@/components/monitors/StatusIcon";
import { useInView } from "@/hooks/useInView";
import { ESCALATION, PIPELINE_RAIL, PIPELINE_RULE } from "@/lib/landing";
import { Container } from "./Container";
import { PipelineStep } from "./PipelineStep";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function AlertPipeline() {
  const titleId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const isRailInView = useInView(railRef);

  return (
    <section id="alerts" aria-labelledby={titleId} className="scroll-mt-20 py-20 lg:py-28">
      <Container>
        <SectionHeading titleId={titleId} eyebrow="How alerting works" title="From failed check to the right person.">
          Rules decide when a failure is real. Escalation decides who hears about it. Maintenance windows keep everyone
          quiet.
        </SectionHeading>

        <div ref={railRef} data-in-view={isRailInView} aria-hidden className="wipe mt-12 overflow-hidden lg:mt-16">
          <CheckTrail checks={PIPELINE_RAIL} className="w-full justify-between" />
        </div>

        <Reveal className="mt-6">
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PipelineStep time="14:02:07" title="Check fails">
              <p className="flex items-center gap-2 font-mono text-xs text-ink">
                <StatusIcon status="down" className="size-3.5" />
                503 from BOM and FRA
              </p>
            </PipelineStep>
            <PipelineStep time="14:02:38" title="Rule matches">
              <code className="rounded-md border border-line bg-panel px-3 py-2 font-mono text-xs text-ink">
                {PIPELINE_RULE}
              </code>
            </PipelineStep>
            <PipelineStep time="14:02:39" title="Incident opens">
              <div className="flex flex-col items-start gap-2">
                <IncidentStatusPill status="investigating" />
                <span>#142 Checkout API is down</span>
              </div>
            </PipelineStep>
            <PipelineStep time="14:02:40" title="Escalation starts">
              <ol className="flex flex-col gap-2">
                {ESCALATION.map((step) => (
                  <li key={step.after} className="flex items-baseline gap-3">
                    <span className="w-9 shrink-0 font-mono text-xs text-subtle">{step.after}</span>
                    <span className="font-medium">{step.channel}</span>
                    <span className="truncate font-mono text-xs text-muted">{step.target}</span>
                  </li>
                ))}
              </ol>
            </PipelineStep>
          </ol>
        </Reveal>

        <p className="mt-8 max-w-xl text-body text-pretty text-muted">
          Not sure about a threshold? Backtest the rule against last week's checks and see every alert it would have
          sent.
        </p>
      </Container>
    </section>
  );
}
