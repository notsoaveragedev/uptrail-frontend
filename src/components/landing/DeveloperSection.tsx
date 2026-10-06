import { useId } from "react";
import { DEVELOPER_POINTS } from "@/lib/landing";
import { CodePanel } from "./CodePanel";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";

export function DeveloperSection() {
  const titleId = useId();

  return (
    <section id="developers" aria-labelledby={titleId} className="scroll-mt-20 border-y border-line bg-panel py-24">
      <Container className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col">
          <SectionHeading titleId={titleId} eyebrow="For developers" title="Monitors as code. Incidents as webhooks.">
            A REST API with scoped keys, signed webhooks for every incident event, and an uptime badge for your README.
          </SectionHeading>
          <dl className="mt-10 flex flex-col gap-5">
            {DEVELOPER_POINTS.map((point) => (
              <div key={point.code} className="flex flex-col gap-1">
                <dt className="font-mono text-xs text-ink">{point.code}</dt>
                <dd className="text-muted">{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <CodePanel />
      </Container>
    </section>
  );
}
