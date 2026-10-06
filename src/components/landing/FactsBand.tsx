import { LANDING_FACTS } from "@/lib/landing";
import { Container } from "./Container";

export function FactsBand() {
  return (
    <section aria-label="Uptrail at a glance" className="border-y border-line bg-panel">
      <Container>
        <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {LANDING_FACTS.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 bg-panel px-1 py-8 sm:px-6">
              <dt className="text-caps font-semibold tracking-widest text-muted uppercase">{fact.label}</dt>
              <dd className="order-first font-mono text-display font-medium tracking-tight">{fact.value}</dd>
              <dd className="text-xs text-subtle">{fact.detail}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
