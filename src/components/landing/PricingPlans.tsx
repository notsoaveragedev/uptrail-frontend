import { useId } from "react";
import { LinkButton } from "@/components/ui/LinkButton";
import { PLANS } from "@/lib/landing";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { StartButton } from "./StartButton";

export function PricingPlans({ isSignedIn }: { isSignedIn: boolean }) {
  const titleId = useId();

  return (
    <section id="pricing" aria-labelledby={titleId} className="scroll-mt-20 py-20 lg:py-28">
      <Container>
        <SectionHeading titleId={titleId} title="Free to start. Fair when you grow.">
          Every plan gets all three regions, every alert channel and a public status page.
        </SectionHeading>
        <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_16rem]">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-lg border bg-card p-6 ${plan.cta === "pro" ? "border-line-strong" : "border-line"}`}
            >
              <h3 className="text-md font-semibold">{plan.name}</h3>
              <p className="mt-1 text-muted">{plan.summary}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-mono text-display font-medium tracking-tight">{plan.price}</span>
                {plan.period && <span className="text-xs text-subtle">{plan.period}</span>}
              </p>
              <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
                {plan.limits.map((limit) => (
                  <li key={limit} className="py-2.5">
                    {limit}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex">
                {plan.cta === "pro" ? (
                  <LinkButton size="large" to="/signup?plan=pro">
                    Choose Pro
                  </LinkButton>
                ) : (
                  <StartButton isSignedIn={isSignedIn} />
                )}
              </div>
            </article>
          ))}
          <p className="text-muted lg:pt-6">
            No card needed for Free. Upgrade, downgrade or cancel from Settings at any time, and keep your status page
            history either way.
          </p>
        </div>
      </Container>
    </section>
  );
}
