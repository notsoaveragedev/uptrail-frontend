import { useId } from "react";
import { BentoCard } from "./BentoCard";
import { Container } from "./Container";
import { ErrorBudget } from "./ErrorBudget";
import { LatencyPanel } from "./LatencyPanel";
import { RegionVerdict } from "./RegionVerdict";
import { Reveal } from "./Reveal";
import { RoleExplorer } from "./RoleExplorer";
import { SectionHeading } from "./SectionHeading";

export function ProductBento() {
  const titleId = useId();

  return (
    <section id="product" aria-labelledby={titleId} className="scroll-mt-20 py-20 lg:py-28">
      <Container>
        <SectionHeading titleId={titleId} title="One board for every signal.">
          Live checks, latency, regions and error budgets in one place, with roles that keep the right hands on each.
        </SectionHeading>
        <Reveal className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-12">
          <BentoCard
            className="lg:col-span-7 lg:row-span-2"
            title="Latency you can read."
            body="p50 and p95 per check, with the alert threshold, down periods and anomalies marked on the chart."
          >
            <LatencyPanel />
          </BentoCard>
          <BentoCard
            className="lg:col-span-5"
            title="Three regions, one verdict."
            body="A monitor goes down only when two regions agree, so one flaky hop never pages you."
          >
            <RegionVerdict />
          </BentoCard>
          <BentoCard
            className="lg:col-span-5"
            title="Error budget at a glance."
            body="Set an SLO per monitor and see how much budget is left this month."
          >
            <ErrorBudget />
          </BentoCard>
          <BentoCard
            className="lg:col-span-12"
            title="Roles that match your team."
            body="Owner, Admin, Editor and Viewer, plus custom roles and per-project access. Every change lands in the audit log."
          >
            <RoleExplorer />
          </BentoCard>
        </Reveal>
      </Container>
    </section>
  );
}
