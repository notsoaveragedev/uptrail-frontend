import { useId, useRef } from "react";
import { CheckTrail } from "@/components/monitors/CheckTrail";
import { LinkButton } from "@/components/ui/LinkButton";
import { useInView } from "@/hooks/useInView";
import { FINAL_TRAIL } from "@/lib/landing";
import { Container } from "./Container";
import { StartButton } from "./StartButton";

export function FinalCta({ isSignedIn }: { isSignedIn: boolean }) {
  const titleId = useId();
  const trailRef = useRef<HTMLDivElement>(null);
  const isTrailInView = useInView(trailRef);

  return (
    <section
      aria-labelledby={titleId}
      className="hero-backdrop overflow-hidden pt-24 pb-20 [--glow-at:50%_100%] lg:pt-32"
    >
      <Container className="flex flex-col items-center text-center">
        <h2 id={titleId} className="display-stretch text-headline font-semibold tracking-tight lg:text-hero">
          Start your trail.
        </h2>
        <p className="mt-4 text-body text-muted sm:text-lead">Add your first monitor in under two minutes.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <StartButton isSignedIn={isSignedIn} />
          {!isSignedIn && (
            <LinkButton size="large" to="/login">
              Log in
            </LinkButton>
          )}
        </div>
        <div
          ref={trailRef}
          data-in-view={isTrailInView}
          aria-hidden
          className="wipe mt-16 flex w-full justify-center overflow-hidden"
        >
          <CheckTrail checks={FINAL_TRAIL} />
        </div>
      </Container>
    </section>
  );
}
